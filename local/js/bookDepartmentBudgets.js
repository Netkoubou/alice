'use strict';
var log4js = require('log4js');
var moment = require('moment');
var util   = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('waning');
var log_crit = log4js.getLogger('critical');

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[bookDepartmentBudgets] invalid session.');
        return;
    }

    util.query(function(db) {
        res.json({ status: 255 });
        db.close();
    });
};
