'use strict';
var moment = require('moment');
var log4js = require('log4js');
var util   = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[computeOutgoes] invalid session.');
        return;
    }


    /*
     * 各月の検索範囲を、馬鹿正直に配列で持っておく。
     */
    var months = [
        [
            req.body.year.toString() + '/04/01',
            req.body.year.toString() + '/04/30'
        ],
        [
            req.body.year.toString() + '/05/01',
            req.body.year.toString() + '/05/31'
        ],
        [
            req.body.year.toString() + '/06/01',
            req.body.year.toString() + '/06/30'
        ],
        [
            req.body.year.toString() + '/07/01',
            req.body.year.toString() + '/07/31'
        ],
        [
            req.body.year.toString() + '/08/01',
            req.body.year.toString() + '/08/31'
        ],
        [
            req.body.year.toString() + '/09/01',
            req.body.year.toString() + '/09/30'
        ],
        [
            req.body.year.toString() + '/10/01',
            req.body.year.toString() + '/10/31'
        ],
        [
            req.body.year.toString() + '/11/01',
            req.body.year.toString() + '/11/30'
        ],
        [
            req.body.year.toString() + '/12/01',
            req.body.year.toString() + '/12/31'
        ],
        [
            (req.body.year + 1).toString() + '/01/01',
            (req.body.year + 1).toString() + '/01/31'
        ],
        [
            (req.body.year + 1).toString() + '/02/01',
            (req.body.year + 1).toString() + '/02/29'
        ],
        [
            (req.body.year + 1).toString() + '/03/01',
            (req.body.year + 1).toString() + '/03/31'
        ]
    ];

    var outgoes  = [];

    function fill_outgo(db, orders, costs, row) {
        months.forEach(function(month) {
            /*
             * start: 支出の算出対象の月の始めの日
             * end:   支出の算出対象の月の終わりの日
             * sum:   算出対象の月の総支出 (発注と経費の合計)
             */
            var start = moment(month[0], 'YYYY/MM/DD').valueOf();
            var end   = moment(month[1], 'YYYY/MM/DD').valueOf();
            var sum   = 0;
            
            orders.forEach(function(o) {
                o.products.forEach(function(p) {
                    var matched = p.state.match(/^(\d{4}\/\d{2}\/\d{2})\s+/);
    
    
                    /*
                     * 発注の個々物品のうち、納品済みになっているものを選び
                     * 出す。納品済みになっている物品の状態 (state) には、
                     * 納品日が YYYY/MM/DD 形式で (そしてその後に単価が)
                     * 入るという超絶クソ仕様となっている。
                     * つまり、上記の正規表現で納品済みであるかを確認し、
                     * さらに納品済みならば納品日を取り出すようになっている。
                     */
                    if (matched) {
                        var date = moment(matched[1], 'YYYY/MM/DD').valueOf();
    
                        if (start <= date && date <= end) {
                            sum += p.billing_amount;
                        }
                    }
                });
            });

            costs.forEach(function(c) {
                c.breakdowns.forEach(function(b) {
                    var date = moment(b.date, 'YYYY/MM/DD').valueOf();
    
                    if (start <= date && date <= end) {
                        sum += b.price * b.quantity;
                    }
                });
            });

            row.outgoes.push(sum);
        });
    }


    /*
     * 部門診療科コードから部門診療科名を辿る。
     * 手っ取り早く、departments コレクションから全部門診療科のデータを
     * 引っこ抜き、そこから辿ることにする。
     * あぁ素晴らしき哉、富豪プログラミング。
     */
    function fill_department_names(db, orders, costs) {
        db.collection('departments').find().toArray(function(err, ds) {
            if (err == null) {
                outgoes.forEach(function(outgo, i) {
                    var code = outgo.department_code;

                    ds.forEach(function(department) {
                        if (code === department._id.toString() ) {
                            outgo.department_name = department.name;
                        }
                    });


                    /*
                     * ここで、対象となる部門診療科の発注と経費精算だけを
                     * 引っこ抜いておく
                     */
                    var os = orders.filter(function(o) {
                        return code === o.department_code;
                    });

                    var cs = costs.filter(function(c) {
                        return code === c.department_code;
                    });

                    fill_outgo(db, os, cs, outgo);
                });

                db.close();
                res.json({ status: 0, outgoes: outgoes });
            } else {
                db.close();
                res.json({ status: 255 });
                log_warn.warn(err);

                var msg = '[computeOutgoes] failed to access ' +
                          '"departments" collection.';

                log_warn.warn(msg);
            }
        });
    }


    /*
     * 支出の算出に必要な発注を引っこ抜く。
     * 算出の対象年度の発注だけでなく、前年度下半期及び翌年度上半期まで
     * 引っこ抜くのは、年度を遡ったり跨ったりして締めることがあるため。
     */
    function pickup_orders_and_costs(db) {
        var start = (req.body.year - 1).toString() + '/10/01';
        var end   = (req.body.year + 1).toString() + '/09/30';

        db.collection('orders').find({
            drafting_date: {
                '$gte': start,
                '$lte': end
            },
            is_alive: true
        }).toArray(function(err, orders) {
            if (err == null) {
                db.collection('costs').find({
                    cost_state: 'APPROVED',
                    drafting_date: {
                        '$gte': start,
                        '$lte': end
                    }
                }).toArray(function(err, costs) {
                    if (err == null) {
                        fill_department_names(db, orders, costs);
                    } else {
                        db.close();
                        res.json({ status: 255 });
                        log_warn.warn(err);

                        var msg = '[computeOutgoes] failed to access ' +
                                  '"costs" collection.';

                        log_warn.warn(msg);
                    }
                });
            } else {
                db.close();
                res.json({ status: 255 });
                log_warn.warn(err);

                var msg = '[computeOutgoes] failed to access ' +
                          '"orders" collection.';

                log_warn.warn(msg);
            }
        });
    }

    util.query(function(db) {
        /*
         * まず、予算と収入が記録されている部門診療科の一覧を、
         * budgets_and_incomes コレクションを基に作成する。
         * departments コレクションを基にしないのは、
         * 年度の途中で消された部門診療科に対応するため。
         * departments コレクションを基にできれば楽なのだが、
         * それは言わない約束。
         *
         * とりあえず部門診療科コードを引っこ抜く。
         */
        db.collection('budgets_and_incomes').find({
            year: req.body.year
        }).toArray(function(err, budgets_and_incomes) {
            if (err == null) {
                if (budgets_and_incomes.length == 0) {
                    db.close();
                    res.json({ status: 0, outgoes: [] });
                    return;
                }

                budgets_and_incomes.filter(function(doc) {
                    // ログインしているユーザが所属していない部門診療科を除く
                    var is_belonged = false;

                    if (req.session.user.privileged.administrate) {
                        is_belonged = true;
                    } else {
                        req.session.user.departments.forEach(function(d) {
                            if (d.code.toString() === doc.department_code) {
                                is_belonged = true;
                            }
                        });
                    }

                    return is_belonged;
                }).forEach(function(doc) {
                    // 仮りの返り値作成
                    outgoes.push({
                        department_code: doc.department_code,
                        department_name: '',    // 後で埋める
                        outgoes:         []
                    });
                });

                pickup_orders_and_costs(db);
            } else {
                db.close();
                res.json({ status: 255 });
                log_warn.warn(err);

                var msg = '[computeOutgoes] failed to access ' +
                          '"budgets_and_incomes" collection.';

                log_warn.warn(msg);
            }
        });
    });
}
