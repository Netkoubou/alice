'use strict';
var bcrypt = require('bcrypt');
var log4js = require('log4js');
var util   = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');

module.exports = function(req, res) {
    var account    = req.body.account;
    var passphrase = req.body.passphrase;
    
    util.query(function(db) {
        var cursor = db.collection('users').find({ account: account });

        cursor.limit(1).next(function(err, user) {
            db.close();

            if (user != null && bcrypt.compareSync(passphrase, user.hash) ) {
                req.session.user_id = user._id;
                res.json({
                    status: 0,
                    user: { 
                        privileged:  user.privileged,
                        departments: user.departments
                    }
                });

                log_info.info(account + ' logged in.');
            } else {
                res.json({ status: 1 });
                log_info.info(account + ' login failed.');
            }
        });
    });
};
