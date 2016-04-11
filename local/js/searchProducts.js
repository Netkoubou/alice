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

    util.query(function(db) {
        var sel = { is_alive: true };

        if (req.body.department_code != '') {
            sel['$or'] = [
                { is_common_item:   true },
                { department_codes: new ObjectID(req.body.department_code) }
            ];
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
                if (products.length > 999) {
                    res.json({ status: 1 });
                } else {
                    products.forEach(function(p) {
                        p.code = p._id;

                        delete p._id;
                        delete p.is_alive;
                    });

                    res.json({ status: 0, products: products });
                }
            } else {
                db.close();
                res.json({ status: 255 });

                if (err != null) {
                    log_warn.warn(err);
                }

                var msg = '[searchProducts] ' +
                          'failed to find in "products" collection.';

                log_warn.warn(msg);
            }
        });
    });
};
