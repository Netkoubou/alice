'use strict';
var log4js = require('log4js');
var util   = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');

module.exports = function(req, res) {
    var order_code   = req.body.order_code;
    var order_state  = req.body.order_state;
    var order_remark = req.body.order_remark;
    var msg;

    util.query(function(db) {
        db.collection('orders').update(
            { order_code: req.body.order_code },
            {
                '$set': {
                    order_state:  req.body.order_state,
                    order_remark: req.body.order_remark
                }
            },
            function(err) {
                db.close();

                if (err == null) {
                    res.json({ status: 0 });
                } else {
                    res.json({ status: 255 });

                    if (err != null) {
                        log_warn.warn(err);
                    }

                    msg = '[changeOrderState] ' +
                          'failed to find order code: "' + order_code +
                          '" in "orders" collection.';
                    log_warn.warn(msg);
                }
            }
        );
    });
};
