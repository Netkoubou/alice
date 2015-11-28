'use strict';
var ObjectID = require('mongodb').ObjectID;
var log4js   = require('log4js');
var moment   = require('moment');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('ctitical');


function update_prices(db, req, prices) {
    var product_counter = 0;

    prices.forEach(function(p) {
        var id     = new ObjectID(p.product_code);
        var cursor = db.collection('products').find({ _id: id }).limit(1);
        var msg;

        cursor.next(function(err, prd) {
            if (err == null && prd != null) {
                var min = (prd.min_price > p.price)? p.price: prd.min_price;
                var max = (prd.max_price < p.price)? p.price: prd.max_price;

                db.collection('products').updateOne(
                    { _id: id },
                    {
                        '$set': {
                            min_price: min,
                            cur_price: p.price,
                            max_price: max
                        }
                    },
                    function(err, result) {
                        if (err != null) {
                            log_warn.warn(err);
                        }

                        if (result.result.ok != 1) {
                            msg = '[updateOrder] ' +
                                'failed to update products: "' +
                                p.product_code + '" by "' +
                                req.session.user.account + '".';

                            log_warn.warn(msg);
                        }
    
                        product_counter++;

                        if (product_counter == prices.length) {
                            db.close();
                        }
                    }
                );
            } else {
                if (err != null) {
                    log_warn.warn(err);
                }

                msg = '[updateOrder] ' +
                      'failed to find product: "' + p.product_code + '".';

                log_warn.warn(msg);
    
                product_counter++;

                if (product_counter == prices.length) {
                    db.close();
                }
            }
        });
    });
}


/*
 * 発注の更新が主な目的だが、orders コレクションだけではなく、
 * products コレクションも更新しなくてはならないことに注意。
 * 何故なら、(現在) 単価は、products コレクションの各物品に設定される
 * 値であるから。
 * MongoDB はトランザクションをサポートしていないため、
 * products コレクションの更新は保証するも、それほど重要な値ではない単価の
 * 更新の保証は諦める。
 */
module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[updateOrder] invalid session.');
        return;
    }

    util.query(function(db) {
        var now          = moment().format('YYYY/MM/DD');
        var prices       = [];  /* 単価更新用の配列 */
        var products     = req.body.products.map(function(p) {
            prices.push({ product_code: p.code, price: p.price });

            return {
                code:           p.code,
                quantity:       p.quantity,
                state:          p.state,
                billing_amount: p.billing_amount,
            };
        });

        db.collection('orders').updateOne(
            {
                order_code:    req.body.order_code,
                order_version: req.body.order_version
            },
            {
                '$set': {
                    order_state:   req.body.order_state,
                    order_remark:  req.body.order_remark,
                    order_version: req.body.order_version + 1,
                    trader_code:   req.body.trader_code,
                    products:      products,
                    last_modified_date: now,
                    last_modifier_code: req.session.user._id
                }
            },
            function update(err, result) {
                var msg;
    
                if (err == null) {
                    if (result.matchedCount == 0) {
                        /*
                         * order_version が不一致。
                         * つまり、他のユーザが既にドキュメントを更新した、
                         * ということを示す。即ち、この更新は古い情報に基づ
                         * いている訳で、このまま進むと先の更新が無かった
                         * ことになってしまう。
                         * ということで、更新を諦め、ユーザにその旨を通知する。
                         */
                        db.close();
                        res.json({ status: 1 });
                        msg = '[updateOrder] unmatched version of order: "' +
                              req.body.order_code + '" ' +
                              'by "' + req.session.user.account + '".';

                        log_info.info(msg);
                    } else {
                        /*
                         * ここで orders コレクションの更新が完了。
                         * 一旦、DB の更新完了をクライアントに通知してから、
                         * products コレクションに新単価を登録する。
                         */
                        res.json({
                            status:        0,
                            order_version: req.body.order_version + 1
                        });
                        msg = '[updateOrder] updated order: "' +
                              req.body.order_code + '" ' +
                              'by "' + req.session.user.account + '".';
    
                        log_info.info(msg);
                        update_prices(db, req, prices);
                    }
                } else {
                    db.close();
                    res.json({ status: 255 });
                    log_warn.warn(err);
    
                    msg = '[updateOrder] failed to update order: "' +
                          req.body.order_code + '" ' +
                          'by "' + req.session.user.account + '".';
    
                    log_warn.warn(msg);
                }
            }
        );
    });
};
