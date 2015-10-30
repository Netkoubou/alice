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

    res.json({ status: 0 });
    log_info.info(req.session.user.account + ' logged out.');
    req.session.destroy();
};
