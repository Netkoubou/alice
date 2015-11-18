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
        log_warn.warn('[bookCost] invalid session.');
        return;
    }

    util.query(function(db) {
        var msg;
        var cost = {
            drafting_date:      moment().format('YYYY/MM/DD'),
            drafter_code:       req.session.user._id,
            department_code:    req.body.department_code,
            account_title_code: req.body.account_title_code,
            remark:             req.body.remark,
            state:              'APPROVING',
            breakdowns:         req.body.breakdowns
        };

        db.collection('costs').insertOne(cost, function(err, result) {
            db.close();

            if (err == null) {
                res.json({ status: 0 });

                msg = '[bookCost] booked cost by ' +
                      req.session.user.account + '".';

                log_info.info(msg);
            } else {
                res.json({ status: 255 });
                log_warn.warn(err);

                msg = '[bookCost] failed to book cost by "' +
                      req.session.user.account + '".';

                log_warn.warn(msg);
            }
        });
    });
};
