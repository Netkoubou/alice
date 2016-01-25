'use strict';
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
    var finished = [];
    var already_sent = false;


    /*
     * 発注と経費の合計を算出
     */
    function compute_outgo(orders, costs) {
        var sum = 0;

        orders.forEach(function(o) {
            o.products.forEach(function(p) {
                sum += p.billing_amount;
            });
        });

        costs.forEach(function(c) {
            c.breakdowns.forEach(function(b) {
                sum += b.price * b.quantity;
            });
        });

        return sum;
    }

    /*
     * row.department_code で特定される部門診療科の、
     * month_index で示される月の支出を算出する。
     */
    function fill_outgo(db, row, months_index) {
        if (months_index >= months.length) {
            finished.push(true);

            if (finished.length == outgoes.length) {
                res.json({ status: 0, outgoes: outgoes });
                already_sent = true;
            }

            return;
        }

        db.collection('orders').find({
            completed_date: {
                '$gte': months[months_index][0],
                '$lte': months[months_index][1]
            },
            department_code: row.department_code,
            is_alive:        true
        }).toArray(function(err, orders) {
            if (already_sent) {
                return;
            }

            if (err == null) {
                db.collection('costs').find({
                    fixed_date: {
                        '$gte': months[months_index][0],
                        '$lte': months[months_index][1]
                    },
                    department_code: row.department_code
                }).toArray(function(err, costs) {
                    if (already_sent) {
                        return;
                    }

                    if (err == null) {
                        /*
                         * ここがキモ、他は枝葉末節
                         */
                        row.outgoes.push(compute_outgo(orders, costs) );
                        fill_outgo(db, row, months_index + 1);
                    } else {
                        db.close();
                        log_warn.warn(err);

                        var msg = '[computeOutgoes] failed to access ' +
                                  '"costs" collection.';

                        log_warn.warn(msg);
                        already_sent = true;
                    }
                });
            } else {
                db.close();
                res.json({ status: 255 });
                log_warn.warn(err);

                var msg = '[computeOutgoes] failed to access ' +
                          '"orders" collection.';

                log_warn.warn(msg);
                already_sent = true;
            }
        });
    }


    /*
     * 部門診療科コードから部門診療科名を辿る。
     * 手っ取り早く、departments コレクションから全部門診療科のデータを
     * 引っこ抜き、そこから辿ることにする。
     * あぁ素晴らしき哉、富豪プログラミング。
     */
    function fill_department_names(db) {
        db.collection('departments').find().toArray(function(err, ds) {
            if (err == null) {
                outgoes.forEach(function(outgo, i) {
                    if (already_sent) {
                        return;
                    }

                    ds.forEach(function(department) {
                        var code = outgo.department_code;
                        var id   = department._id.toString();

                        if (code === id) {
                            outgo.department_name = department.name;
                        }
                    });

                    fill_outgo(db, outgo, 0);
                });
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
                budgets_and_incomes.forEach(function(doc) {
                    outgoes.push({
                        department_code: doc.department_code,
                        department_name: '',
                        outgoes:         []
                    });
                });

                fill_department_names(db);
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
