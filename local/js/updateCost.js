'use strict';
var ObjectID = require('mongodb').ObjectID;
var log4js   = require('log4js');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('ctitical');

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[updateCost] invalid session.');
        return;
    }

    util.query(function(db) {
        db.collection('costs').findOneAndUpdate(
            {
                cost_code: req.body.cost_code
            },
            {
                '$set': {
                    account_title_code: req.body.account_title_code,
                    cost_remark:        req.body.cost_remark,
                    breakdowns:         req.body.breakdowns
                }
            },
            function(err, result) {
            var msg;
                db.close();

                if (err == null) {
                    res.json({ status: 0 });
                    msg = '[updateCost] updated order: "' +
                          req.body.cost_code + '" ' +
                          'by "' + req.session.user.account + '".';
                    log_info.info(msg);
                } else {
                    res.json({ status: 255 });
                    msg = '[updateCost] failed to update cost: "' +
                          rerq.body.cost_code + '" ' +
                          'by "' + req.session.user.account + '".';
                    log_warn.warn(msg);
                }
            }
        );
    });
};
