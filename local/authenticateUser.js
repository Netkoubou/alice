'use strict';
var bcrypt = require('bcrypt');
var query  = require('./query');

module.exports = function(req, res) {
    var account    = req.body.account;
    var passphrase = req.body.passphrase;
    
    query(function(db) {
        var cursor = db.collection('users').find({ account: account });

        cursor.each(function(err, user) {
            if (user != null && bcrypt.compareSync(passphrase, user.hash) ) {
                req.session.account = user.account;
                res.json({
                    status: 0,
                    user: { 
                        privileged:  user.privileged,
                        departments: user.departments
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
