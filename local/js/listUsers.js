'use strict';
var ObjectID = require('mongodb').ObjectID;
var log4js   = require('log4js');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[listUsers] invalid session.');
        return;
    }

    util.query(function(db) {
        var sel = {
            is_alive:    true,
            departments: {
                '$elemMatch': { code: new ObjectID(req.body.department_code) } 
            }
        };

        db.collection('users').find(sel).toArray(function(err, users) {
            db.close();

            if (err == null && users.length > 0) {
                res.json({
                    status: 0,
                    users:  users.map(function(u) {
                        return {
                            account:     u.account,
                            name:        u.name,
                            email:       u.email,
                            privileged:  u.privileged,
                            departments: u.departments
                        };
                    })
                });
            } else if (users.length == 0) {
                res.json({ status: 0, users: [] });
            } else {
                res.json({ status: 255 });
                log_warn.warn(err);

                var msg = '[listUsers] failed to access "users" collection.';

                log_warn.warn(msg);
            }
        });
    });
};
