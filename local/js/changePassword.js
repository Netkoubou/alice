'use strict';
var bcrypt = require('bcrypt');
var log4js = require('log4js');
var util   = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');

function callback_updateOne(req, res, db) {
    return function(err, result) {
        db.close();

        var msg;

        if (err == null) {
            res.json({ status: 0 });

            msg = '[changePassword] changed password by "' +
                  req.session.user.account + '".';

            log_info.info(msg);
        } else {
            res.json({ status: 255 });
            log_warn.warn(err);

            msg = '[changePassword] failed to change password by "' +
                  req.session.user.account + '".';

            log_warn.warn(msg);
        }
    };
}

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[changePassword] invalid session.');
        return;
    }

    util.query(function(db) {
        var collection = db.collection('users');
        var account    = req.session.user.account;
        var cursor     = collection.find({ account: account });

        cursor.limit(1).next(function(err, user) {
            var msg;

            if (err == null) {
                var expiring = req.body.old;
                var refresh  = req.body.new;

                if (user != null && bcrypt.compareSync(expiring, user.hash) ) {
                    var hash = bcrypt.hashSync(refresh, bcrypt.genSaltSync() );

                    collection.updateOne(
                        { account: account },
                        { '$set': { hash: hash } },
                        callback_updateOne(req, res, db)
                    );
                } else {
                    db.close();
                    res.json({ status: 1 });

                    msg = '[changePassword] not matched old password of "' +
                          req.session.user.account + '".';

                    log_info.info(msg);
                }
            } else {
                db.close();
                res.json({ status: 255 });
                log_warn.warn(err);

                msg = '[changePassword] ' +
                      'failed to access "users" collection by "' +
                      req.session.user.account + '".';

                log_warn.warn(msg);
            }
        });
    });
};
