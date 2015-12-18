'use strict';
var ObjectID = require('mongodb').ObjectID;
var bcrypt   = require('bcrypt');
var log4js   = require('log4js');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[bookCost] invalid session.');
        return;
    }

    var product = req.body;

    product.category_code = new ObjectID(product.category_code);
    product.trader_code   = new ObjectID(product.trader_code);
    product.is_alive      = true;

    product.department_codes = product.department_codes.map(function(d) {
        return new ObjectID(d);
    });

    util.query(function(db) {
        db.collection('products').insertOne(product, function(err, result) {
            var msg;

            db.close();

            if (err == null) {
                res.json({ status: 0 });

                msg = '[registerProduct] registered product by "' +
                      req.session.user.account + '".';

                log_info.info(msg);
            } else {
                res.json({ status: 255 });
                log_warn.warn(err);

                msg = '[registerProduct] failed to register product by "' +
                      req.session.user.account + '".';

                log_warn.warn(msg);
            }
        });
    });
};
