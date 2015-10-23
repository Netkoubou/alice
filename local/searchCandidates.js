'use strict';
var ObjectID = require('mongodb').ObjectID;
var util     = require('./util');

module.exports = function(req, res) {
    var order_type      = req.body.order_type;  // 不要!
    var department_code = req.body.department_code;
    var category_code   = req.body.category_code;
    var trader_code     = req.body.trader_code;
    var search_text     = req.body.search_text;
    var candidates      = [];

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

        var count_candidates = 0;

        db.collection('products').find(sel).toArray(function(err, products) {
            if (products.length == 0) {
                res.json({ status: 0, candidates: [] });
            } else {
                products.forEach(function(p) {
                    var id     = new ObjectID(p.trader);
                    var cursor = db.collection('traders').find({ _id: id});

                    cursor.limit(1).next(function(err, trader) {
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
                            res.json({ status: 0, candidates: candidates });
                            db.close();
                        }
                    });
                });
            }
        });
    });
};
