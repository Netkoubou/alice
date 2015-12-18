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
        req.json({ status: 255 });
        log_warn.warn('[updateProduct] invalid session.');
        return;
    }

    var product_id = new ObjectID(req.body.code);
    var product    = req.body;

    product.category_code = new ObjectID(product.category_code);
    product.trader_code   = new ObjectID(product.trader_code);
    product.is_alive      = true;

    product.department_codes = product.department_codes.map(function(d) {
        return new ObjectID(d);
    }); 

    delete product.code;

    util.query(function(db) {
        db.collection('products').replaceOne(
            { _id: product_id },
            product,
            function(err, result) {
                var msg;
                db.close();
    
                if (err == null) {
                    res.json({ status: 0 });
    
                    msg = '[updateProduct] updated product: "' +
                          product.name + '" by "' +
                          req.session.user.account + '".';
    
                    log_info.info(msg);
                } else {
                    res.json({ status: 255 });
                    log_warn.warn(err);
    
                    msg = '[updateProduct] failed to update product: "' +
                          product.name + '" by "' +
                          req.session.user.account + '".';
    
                    log_warn.warn(msg);
                }
            }
        );
    });
};
