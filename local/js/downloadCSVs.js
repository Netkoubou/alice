'use strict';

var log4js = require('log4js');
var path   = require('path');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.sendStatus(401);
        log_warn.warn('[registerItem] invalid session.');
        return;
    }

    var privileged = req.session.user.privileged;

    if (!privileged.approve && !privileged.process_order) {
        res.sendStatus(403);
        log_warn.warn('[registerItem] forbidden.');
        return;
    }

    res.sendFile(path.resolve(__dirname + '/../data/csvs.tgz'), function(err) {
        if (err) {
            res.sendStatus(500);
            log_warn.warn(err);
            log_warn.warn('[downloadCSVs] failed.');
        }
    });
};
