'use strict';
var log4js = require('log4js');
var util   = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[changeOrderState] invalid session.');
        return;
    }

    util.query(function(db) {
        db.collection('orders').updateOne(
            { order_code: req.body.order_code },
            {
                '$set': {
                    order_state:  req.body.order_state,
                    order_remark: req.body.order_remark
                }
            },
            function(err, result) {
                var msg;

                db.close();

                if (err == null) {
                    res.json({ status: 0 });

                    msg = '[changeOrderState] ' +
                          'updated order: "' + req.body.order_code + '" ' +
                          'by "' + req.session.user.account + '".';
                    log_info.info(msg);
                } else {
                    res.json({ status: 255 });
                    log_warn.warn(err);

                    msg = '[changeOrderState] ' +
                          'failed to update order: "' +
                          req.body.order_code + '" ' +
                          'by "' + req.session.user.account + '".';

                    log_warn.warn(msg);
                }
            }
        );
    });
};
