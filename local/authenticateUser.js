'use strict';
var bcrypt = require('bcrypt');
var util   = require('./util');

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
            } else {
                res.json({ status: 1 });
            }
        });
    });
};
