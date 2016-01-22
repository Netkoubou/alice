'use strict';
var log4js = require('log4js');
var moment = require('moment');
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
        db.collection('costs').updateOne(
            { cost_code: req.body.cost_code },
            {
                '$set': {
                    cost_remark: req.body.cost_remark,
                    cost_state:  req.body.cost_state,
                    fixed_date:  moment().format('YYYY/MM/DD')
                }
            },
            function(err, result) {
                var msg;
                db.close();

                if (err == null && result.matchedCount == 1) {
                    res.json({ status: 0 });

                    msg = '[fixCost] fixed cost: "' +
                          req.body.cost_code + '" ' +
                          'by ' + req.session.user.account + '".';

                    log_info.info(msg);
                } else {
                    res.json({ status: 255 });
                    
                    if (err != null) {
                        log_warn.warn(err);
                    }

                    msg = '[fixCost] failed to fix cost: "' +
                          req.body.cost_code + '" ' +
                          'by ' + req.session.user.account + '".';

                    log_warn.warn(msg);
                }
            }
        );
    });
};
