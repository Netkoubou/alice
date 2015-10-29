'use strict';
var ObjectID = require('mongodb').ObjectID;
var log4js   = require('log4js');
var moment   = require('moment');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');

module.exports = function(req, res) {
    util.query(function(db) {    
        /*
         * 発注を登録する前に、まず発注番号を作る。
         * 発注番号は、
         * 
         *   - 部門診療科の略称
         *   - 部門診療科の通し番号
         *
         * を '-' で繋げたユニークな文字列。
         * 通し番号は、その部門診療科で登録された発注の数を利用する。
         * ということで、まずその部門診療科が幾つ発注を登録したかを数える。
         */
        var orders = db.collection('orders');
        var sel    = { department_code: req.body.department_code };

        orders.count(sel, function(err, count) {
            var now   = moment().format('YYYY/MM/DD');
            var order = {
                order_code:   '',
                order_type:   req.body.order_type,
                order_state:  'REQUESTING',
                order_remark: req.body.order_remark,

                drafting_date:   now,
                drafter_code:    req.session.user_id,
                department_code: req.body.department_code,
                trader_code:     req.body.trader_code,

                products: req.body.products.map(function(p) {
                    return {
                        code:             p.code,
                        quantity:         p.quantity,
                        state:            'UNORDERED',
                        billing_amount:   0,
                    };
                }),

                last_modified_date: now,
                last_modifier_code: req.session.user_id
            };

            var msg;

            if (err == null && count != null) {
                /*
                 * 次に、部門診療科の略称を引く。
                 * コールバックの嵐でネストが深く見づらいが、
                 * その実、大したことはしていない。
                 */
                var id     = new ObjectID(order.department_code);
                var cursor = db.collection('departments').find({ _id: id });

                cursor.limit(1).next(function(err, department) {
                    if (err == null && department != null) {
                        var pfx = department.abbr + '-';
                        var num = ('0000' + count).slice(-4);

                        order.order_code = pfx + num;
                        orders.insertOne(order, function(err, result) {
                            /*
                             * ここでやっとこさ登録
                             */
                            if (err == null) {
                                res.json({
                                    status: 0,
                                    order_code: order.order_code
                                });

                                msg = '[registerOrder] ' + 
                                      'registered order: "' +
                                      order.order_code + '" ' +
                                      'by "' + req.session.user_id + '".';

                                log_info.info(msg);
                                db.close();
                            } else {
                                db.close();
                                res.json({ status: 255 });
                                log_warn.warn(err);

                                msg = '[registerOrder] ' +
                                      'failed to register order: "' +
                                      order.order_code + '" ' +
                                      'by "' + req.session.user_id + '".';

                               log_warn.warn(msg);
                            }
                        });
                    } else {
                        db.close();
                        res.json({ status: 255 });

                        if (err != null) {
                            log_warn.warn(err);
                        }
                    
                        msg = '[regsiterOrder] ' +
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

                msg = '[registerOrder] failed to access "orders" collection.';

                log_warn.warn(msg);
            }
        });
    });
};
