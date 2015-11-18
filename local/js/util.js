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
            a.filter(function(y) { return eq(x, y); }).length != 0;
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

    build_sfx: function(res, collection_name, department_code, callback) {
        /*
         * 起案番号の接尾辞を作成するユーティリティ。
         * 接尾辞は、
         *
         *   - 部門診療科の略称
         *   - 西暦の年度 4 桁
         *   - 部門診療科のその年度の通し番号
         *
         * を '-' で繋げた文字列。
         * 通し番号は、その部門診療科でその年度に、名前が collection_name
         * であるコレクションに登録した起案の数を利用する。
         * ということで、まずその部門診療科がその年度に幾つ起案したかを数える。
         */
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

            var collection = db.collection(collection_name);
            var sel        = {
                drafting_date:   { '$gte': fiscal_year + '/04/01' },
                department_code: department_code
            }

            collection.count(sel, function(err, count) {
                var msg;

                if (err == null && count != null) {
                    /*
                     * 部門診療科の略称を引く。
                     * コールバックの嵐でネストが深く読み辛いが、
                     * その実大したことはしていない。
                     */
                    var id     = new ObjectID(department_code);
                    var cursor = db.collection('departments');

                    cursor.find({ _id: id }).limit(1).next(function(err, d) {
                        if (err == null && d != null) {
                            var pfx = d.abbr + '-' + fiscal_year + '-';
                            var num = '0000' + (count + 1).toString();
                            var sfx = pfx + num.slice(-4);
                            callback(db, sfx);
                        } else {
                            db.close();
                            res.json({ status: 255 });

                            if (err != null) {
                                log_warn.warn(err);
                            }

                            msg = '[util.build_sfx]' +
                                  'failed to find department: "' + id + '".';

                            log_warn.warn(msg);
                        }
                    });
                } else {
                    db.close();
                    res.json({ status: 255 });

                    if (err != null) {
                        log_warn.warn(err);
                    }

                    msg = '[util.build_sfx] ' +
                          'failed to access "' + collection_name +
                          '" collection.';

                    log_warn.warn(msg);
                }
            });
        });
    }
};
