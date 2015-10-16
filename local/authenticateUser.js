'use strict';
var query = require('./query');

module.exports = function(req, res) {
    var account    = req.body.account;
    var passphrase = req.body.passphrase;
    
    query(function(db) {
        var cursor = db.collection('users').find({ account: account });

        cursor.each(function(err, user) {
            if (user != null && user.passphrase === passphrase) {
                res.json({
                    status: 0,
                    user: {
                        is_privileged: user.is_privileged,
                        is_admin:      user.is_admin,
                        is_urgency:    user.is_urgency,
                        is_approval:   user.is_approval
                    }
                });
            } else {
                res.json({ status: 1 });
            }

            db.close();
            return false;
        });
    });
};
