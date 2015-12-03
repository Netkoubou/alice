'use strict';
var ObjectID = require('mongodb').ObjectID;
var log4js   = require('log4js');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');


module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[searchCandidates] invalid session.');
        return;
    }

    var is_already_sent = false;
    var candidates      = [];

    function lookup_trader_name(db, product, num_of_candidates) {
        var id     = new ObjectID(product.trader_code);
        var cursor = db.collection('traders').find({ _id: id});

        cursor.limit(1).next(function(err, trader) {
            if (is_already_sent) {
                return;
            }

            if (err == null && trader != null) {
                candidates.push({
                    product_code: product._id,
                    product_name: product.name,
                    maker:        product.maker,
                    min_price:    product.min_price,
                    cur_price:    product.cur_price,
                    max_price:    product.max_price,
                    trader_code:  trader._id,
                    trader_name:  trader.name
                });

                if (candidates.length == num_of_candidates) {
                    res.json({ status: 0, candidates: candidates });
                    is_already_sent = true;
                    db.close();
                }
            } else {
                db.close();
                res.json({ status: 255 });
                is_already_sent = true;

                if (err != null) {
                    log_warn.warn(err);
                }

                var msg = '[searchCandidates] failed to find trader: "' +
                          product.trader_code + '".';

               log_warn.warn(msg);
            }
        });
    }

    util.query(function(db) {
        var sel = {
            is_alive:         true,
            department_codes: new ObjectID(req.body.department_code)
        };

        if (req.body.category_code != '') {
            sel.category_code = new ObjectID(req.body.category_code);
        }

        if (req.body.trader_code != '') {
            sel.trader_code = new ObjectID(req.body.trader_code);
        }

        if (req.body.search_text != '') {
            sel.name = new RegExp(req.body.search_text);
        }

        db.collection('products').find(sel).toArray(function(err, products) {
            if (err == null && products != null) {
                if (products.length == 0) {
                    res.json({ status: 0, candidates: [] });
                } else {
                    products.forEach(function(p) {
                        if (is_already_sent) {
                            return;
                        }

                        lookup_trader_name(db, p, products.length);
                    });
                }
            } else {
                db.close();
                res.json({ status: 255 });

                if (err != null) {
                    log_warn.warn(err);
                }

                var msg = '[searchCandidates] ' +
                          'failed to find in "products" collection.';

                log_warn.warn(msg);
            }
        });
    });
};
