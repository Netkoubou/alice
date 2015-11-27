'use strict';
var ObjectID = require('mongodb').ObjectID;
var log4js   = require('log4js');
var moment   = require('moment');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[registerOrder] invalid session.');
        return;
    }

    var department_code = req.body.department_code;
    var today           = moment().format('YYYY/MM/DD');

    util.build_sfx(res, 'orders', department_code, function(db, sfx) {
        var order = {
            order_id:      0,   // 不要 (DBMS に MySQL を用いる場合に必要)
            order_code:    'O-' + sfx,
            order_type:    req.body.order_type,
            order_state:   'REQUESTING',
            order_remark:  req.body.order_remark,
            order_version: 0,

            drafting_date:   today,
            drafter_account: req.session.user.account,
            department_code: department_code,
            trader_code:     req.body.trader_code,

            products: req.body.products.map(function(p) {
                return {
                    code:           p.code,
                    quantity:       p.quantity,
                    state:          'UNORDERED',
                    billing_amount: 0,
                };
            }),

            last_modified_date: today,
            last_modifier_code: req.session.user._id,
            is_alive:           true
        };

        db.collection('orders').insertOne(order, function(err, result) {
            var msg;
            db.close();

            if (err == null) {
                res.json({
                    status:        0,
                    order_code:    order.order_code,
                    order_version: 0
                });

                msg = '[registerOrder] registered order: "' +
                      order.order_code + '" by "' +
                      req.session.user.account + '".';

                log_info.info(msg);
            } else {
                res.json({ status: 255 });
                log_warn.warn(err);

                msg = '[registerOrder] ' +
                      'failed to register order: "' +
                      order.order_code + '" ' +
                      'by "' + req.session.user.account + '".';

               log_warn.warn(msg);
            }
        });
    });
};
