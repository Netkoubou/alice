'use strict';
var ObjectID = require('mongodb').ObjectID;
var bcrypt   = require('bcrypt');
var log4js   = require('log4js');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');

module.exports = function(req, res) {
    if (req.session.user == null) {
        req.json({ status: 255 });
        log_warn.warn('[updateUser] invalid session.');
        return;
    }

    util.query(function(db) {
    });
};
