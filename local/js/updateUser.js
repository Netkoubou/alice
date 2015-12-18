'use strict';
var ObjectID = require('mongodb').ObjectID;
var bcrypt   = require('bcrypt');
var log4js   = require('log4js');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');

function update_user(req, res, db, user) {
    var passphrase = req.body.passphrase;

    if (passphrase != '') {
        user.hash = bcrypt.hashSync(passphrase, bcrypt.genSaltSync() );
    }

    user.name        = req.body.name;
    user.email       = req.body.email;
    user.privileged  = req.body.privileged;
    user.departments = req.body.departments;
    user.departments.forEach(function(d) { d.code = new ObjectID(d.code); });

    db.collection('users').replaceOne(
        { account: req.body.account },
        user,
        function(err, result) {
            var msg;
            db.close();

            if (err == null) {
                res.json({ status: 0 });
                msg = '[updateUser] updated user: "' + req.body.account +
                      '" by "' + req.session.user.account + '".';

                log_info.info(msg);
            } else {
                res.json({ status: 255 });
                log_warn.warn(err);

                msg = '[updateUser] failed to update user: "' +
                      req.body.account + '" by "' +
                      req.session.user.account + '".';

                log_warn.warn(msg);
            }
        }
    );
}

module.exports = function(req, res) {
    if (req.session.user == null) {
        req.json({ status: 255 });
        log_warn.warn('[updateUser] invalid session.');
        return;
    }

    util.query(function(db) {
        db.collection('users').find({
            account: req.body.account
        }).limit(1).next(function(err, user) {
            if (err == null && user != null) {
                update_user(req, res, db, user);
            } else {
                db.close();
                res.json({ status: 255 });

                if (err != null) {
                    log_warn.warn(err);
                }

                var msg = '[updateUser] failed to access ' +
                          '"users" collection by "' +
                          req.session.user.account + '".';

                log_warn.warn(msg);
            }
        });
    });
};
