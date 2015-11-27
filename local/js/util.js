'use strict';
var mongodb  = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var moment   = require('moment');
var log4js   = require('log4js');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('ctitical');

module.exports = {
    query: function(callback) {
        var result;

        mongodb.connect('mongodb://localhost:27017/alice', function(err, db) {
            if (err != null) {
                log_warn(err);
                log_warn('[util.query] cannot connect with MongoDB.');
            } else {
                callback(db);
            }
        });
    },

    uniq: function(array, eq) {
        function exists(x, a) {
            return a.filter(function(y) { return eq(x, y); }).length != 0;
        }
                                                                 
        function iter(rest, ans) {
            if (rest.length < 1) {
                return ans;
            } else {   
                var car = rest[0];
                var cdr = rest.slice(1);

                if (exists(car, ans) ) {
                    return iter(cdr, ans);
                } else {         
                    return iter(cdr, ans.concat(car) );
                }
            }
        }

        if (array.length < 2) {
            return array;
        } else {                           
            return iter(array.slice(1), array.slice(0, 1) );
        }
    },

    build_sfx: function(res, target_name, department_code, callback) {
        /*
         * 起案番号の接尾辞を作成するユーティリティ。
         * 作成したら接尾辞を callback に渡す。
         * 接尾辞は、
         *
         *   - 部門診療科の略称
         *   - 西暦の年度 4 桁
         *   - 部門診療科のその年度の通し番号
         *
         * を '-' で繋げた文字列。
         * 通し番号は、その部門診療科でその年度に、名前が collection_name
         * であるコレクションに登録した起案の数を利用する。
         * その起案の数は、当該部門診療科の
         *
         *   全起案数 - 前年度以前の起案数
         *
         * で求める。
         * 全起案数の獲得とその increment を atomic にするために、
         * 各部門診療科の全起案数用のコレクション、 num_of_orders (発注用) と
         * num_of_costs (経費申請用) を利用する。
         */
        function pick_department_abbr(db, fiscal_year, total) {
            var id     = new ObjectID(department_code);
            var cursor = db.collection('departments').find({ _id: id });

            cursor.limit(1).next(function(err, d) {
                if (err == null && d != null) {
                    var pfx = d.abbr + '-' + fiscal_year + '-';
                    var num = '0000' + (total + 1).toString();
                    var sfx = pfx + num.slice(-4);
                    callback(db, sfx);
                } else {
                    db.close();
                    res.json({ status: 255 });

                    if (err != null) {
                        log_warn.warn(err);
                    }

                    var msg = '[util.build_sfx]' +
                              'failed to find department: "' + id + '".';

                    log_warn.warn(msg);
                }
            });
        }

        function handle_current_total(db, fiscal_year, last_total) {
            db.collection('num_of_' + target_name).findOneAndUpdate(
                { department_code: department_code },
                { '$inc': { total: 1 } },
                { upsert: true },
                function(err, result) {
                    if (err == null) {
                        var total = 0;

                        if (result.value != null) {
                            total = result.value.total - last_total;
                        }

                        pick_department_abbr(db, fiscal_year, total);
                    } else {
                        db.close();
                        res.json({ status: 255 });
                        log_warn.warn(err);

                        var msg = '[util.build_sfx] failed to access ' +
                                  '"num_of_' + target_name + '" collection.';

                        log_warn.warn(msg);
                    }
                }
            );
        }

        this.query(function(db) {
            var now = moment();
            var fiscal_year;


            /*
             * now.month() は 0 == 1 月であることに注意!
             */
            if (now.month() < 3) {
                // 今が 1 〜 3 月なら未だ前の年の年度
                fiscal_year = (now.year() - 1).toString();
            } else {
                // 4 月以降なら今の年の年度
                fiscal_year = now.year().toString();
            }

            var sel = {
                drafting_date: { '$lte': fiscal_year + '/03/31' },
                department_code: department_code
            };

            db.collection(target_name).count(sel, function(err, last_total) {
                if (err == null && last_total != null) {
                    handle_current_total(db, fiscal_year, last_total);
                } else {
                    db.close();
                    res.json({ status: 255 });

                    if (err != null) {
                        log_warn.warn(err);
                    }

                    var msg = '[util.build_sfx] failed to access "' +
                              collection_name + '" collection.';

                    log_warn.warn(msg);
                }
            });
        });
    }
};
