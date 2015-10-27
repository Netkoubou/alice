'use strict';
var ObjectID = require('mongodb').ObjectID;
var log4js   = require('log4js');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');

module.exports = function(req, res) {
    var order_type      = req.body.order_type;  // 不要!
    var department_code = req.body.department_code;
    var category_code   = req.body.category_code;
    var trader_code     = req.body.trader_code;
    var search_text     = req.body.search_text;
    var candidates      = [];
    var msg;

    util.query(function(db) {
        var sel = { departments: new ObjectID(department_code) };

        if (category_code != '') {
            sel.category = new ObjectID(category_code);
        }

        if (trader_code != '') {
            sel.trader = new ObjectID(trader_code);
        }

        if (search_text != '') {
            sel.name = new RegExp(search_text);
        }

        db.collection('products').find(sel).toArray(function(err, products) {
            if (err == null && products != null) {
                if (products.length == 0) {
                    res.json({ status: 0, candidates: [] });
                } else {
                    var count_candidates = 0;

                    products.forEach(function(p) {
                        var id     = new ObjectID(p.trader);
                        var cursor = db.collection('traders').find({ _id: id});

                        cursor.limit(1).next(function(err, trader) {
                            if (err == null && trader != null) {
                                candidates.push({
                                    product_code: p._id,
                                    product_name: p.name,
                                    maker:        p.maker,
                                    min_price:    p.min_price,
                                    cur_price:    p.cur_price,
                                    max_price:    p.max_price,
                                    trader_code:  trader._id,
                                    trader_name:  trader.name
                                });

                                count_candidates++;

                                if (count_candidates == products.length) {
                                    res.json({
                                        status: 0,
                                        candidates: candidates
                                    });
                                    db.close();
                                }
                            } else {
                                db.close();
                                res.json({ status: 255 });

                                if (err != null) {
                                    log_warn.warn(err);
                                }

                                msg = '[searchCandidates] ' +
                                      'failed to find trader: "' +
                                      trader._id + '".';

                               log_warn.warn(msg);
                            }
                        });
                    });
                }
            } else {
                db.close();
                res.json({ status: 255 });

                if (err != null) {
                    log_warn.warn(err);
                }

                msg = '[searchCandidates] ' +
                      'failed to find in "products" collection.';

                log_warn.warn(msg);
            }
        });
    });
};
