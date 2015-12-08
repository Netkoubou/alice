'use strict';
var log4js = require('log4js');
var util   = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[eraseOrder] invalid session.');
        return;
    }

    util.query(function(db) {
        db.collection('orders').findOneAndUpdate(
            {
                order_code:    req.body.order_code,
                order_version: req.body.order_version,
            },
            { '$set': {
                    is_alive:      false,
                    order_version: req.body.order_version + 1
                }
            },
            function(err, result) {
                var msg;

                db.close();

                if (err == null) {
                    if (result.value == null) {
                        res.json({ status: 1 });
                        msg = '[eraseOrder] unmatched version of order: "';
                    } else {
                        res.json({ status: 0 });
                        msg = '[eraseOrder] erased order: "';
                    }

                    msg += req.body.order_code + '" by ' +
                           req.session.user.account + '".';

                    log_info.info(msg);
                } else {
                    res.json({ status: 255 });
                    log_warn.warn(err);

                    msg = '[eraseOrder] ' +
                          'failed to erase order: "' +
                          req.body.order_code + '" ' +
                          'by "' + req.session.user.account + '".';

                    log_warn.warn(msg);
                }
            }
        );
    });
};
