'use strict';
var ObjectID = require('mongodb').ObjectID;
var log4js   = require('log4js');
var moment   = require('moment');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('ctitical');


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
            { order_code: req.body.order_code },
            {
                '$set': {
                    order_state:  req.body.order_state,
                    order_remark: req.body.order_remark,
                    trader_code:  req.body.trader_code,
                    products:     products,
                    last_modified_date: now,
                    last_modifier_code: req.session.user_id
                }
            },
            function update(err, result) {
                var msg;
    
                if (err == null) {
                    /*
                     * ここで orders コレクションの更新が完了。
                     * 一旦、DB の更新完了をクライアントに通知してから、
                     * products コレクションに新単価を登録する。
                     */
                    res.json({ status: 0 });
                    msg = '[updateOrder] updated order: "' +
                          req.body.order_code + '" ' +
                          'by "' + req.session.user_id + '".';
    
                    log_info.info(msg);
    
                    var count_products = 0;
    
                    prices.forEach(function(p) {
                        db.collection('products').updateOne(
                            { _id: new ObjectID(p.product_code) },
                            { '$set': { cur_price: p.price } },
                            function(err, result) {
                                if (err != null) {
                                    log_warn.warn(err);
                                }
    
                                if (result.ok != 1) {
                                    msg = '[updateOrder] ' +
                                          'failed to update products: "' +
                                          p.product_code + '" ' +
                                          'by "' + req.session.user_id + '".';
    
                                    log_warn.warn(msg);
                                }
    
                                count_products++;
    
                                if (count_products == prices.length) {
                                    db.close();
                                }
                            }
                        );
                    });
                } else {
                    db.close();
                    res.json({ status: 255 });
                    log_warn.warn(err);
    
                    msg = '[updateOrder] failed to update order: "' +
                          req.body.order_code + '" ' +
                          'by "' + req.session.user_id + '".';
    
                    log_warn.warn(msg);
                }
            }
        );
    });
};
