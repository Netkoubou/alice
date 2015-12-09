'use strict';
var log4js   = require('log4js');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('ctitical');

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[pickMenuItemsForSearchPane] invalid session.');
        return;
    }

    util.query(function(db) {
        util.retrieve_all_departments_categories_traders(res, db);
    });
};
