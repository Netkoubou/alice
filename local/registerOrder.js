'use strict';
var ObjectID = require('mongodb').ObjectID;
var log4js   = require('log4js');
var moment   = require('moment');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warn');
var log_crit = log4js.getLogger('ctitical');

module.exports = function(req, res) {
    var now   = moment().format('YYYY/MM/DD');
    var order = {
        order_code:   '',
        order_type:   req.body.order_type,
        order_state:  'REQUESTING',
        order_remark: req.body.order_remark,

        drafting_date:   now,
        drafter_code:    req.session.user_id,
        department_code: req.body.department_code,
        trader_code:     req.body.trader_code,

        products: req.body.products.map(function(p) {
            return {
                code:             p.code,
                quantity:         p.quantity,
                state:            'UNORDERED',
                billing_amount:   0,
                last_edited_date: now,
                last_editor_code: req.session.user_id
            };
        }),

        last_modified_date: now,
        last_modifier_code: req.session.user_id
    };

    var msg;

    util.query(function(db) {    
        db.collection('orders').count({}, function(err, count) {
            if (err == null && count != null) {
                var id     = new ObjectID(order.department_code);
                var cursor = db.collection('departments').find({ _id: id });

                cursor.limit(1).next(function(err, department) {
                    if (err == null && department != null) {
                        var pfx = department.abbr + '-';
                        var num = ('000000' + count).slice(-6);

                        order.order_code = pfx + num;
                        db.collection('orders').insert(order);
                        res.json({ status: 0, order_code: order.order_code });
                        db.close();
                    } else {
                        db.close();
                        res.json({ status: 255 });

                        if (err != null) {
                            log_warn.warn(err);
                        }
                    
                        msg = '[regsiterOrder] ' +
                            'failed to find department id: "' + id +
                            '" in "departments" collection.';

                        log_warn.warn(msg);
                    }
                });
            } else {
                db.close();
                res.json({ status: 255 });

                if (err != null) {
                    log_warn.warn(err);
                }

                msg = '[registerOrder] failed to access "orders" collection.';

                log_warn.warn(msg);
            }
        });
    });
};
