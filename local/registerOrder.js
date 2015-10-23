'use strict';
var util = require('./util');

module.exports = function(req, res) {
    var order_type      = req.body.order_type;
    var order_remark    = req.body.order_remark;
    var department_code = req.body.department_code;
    var trader_code     = req.body.trader_code;
    var products        = req.body.products;

    var order_code;
    var order = {};

    db.collection('orders').insert(order);

    res.json({ status: 0, order_code: order_code });
};
