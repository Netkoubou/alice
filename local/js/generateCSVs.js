'use strict';
var exec   = require('child_process').exec;
var log4js = require('log4js');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[generateCSVs] invalid session.');
        return;
    }

    exec('npm run gencsv', function(err) {
        if (err) {
            log_warn.warn(err);
            res.json({ status: 255 });
            log_warn.warn('[generateCSVs] failed.');
        } else {
            res.json({ status: 0 });

            var msg = '[generateCSVs] generated by req.session.user.account.';

            log_info.info(msg);
        }
    });
};
