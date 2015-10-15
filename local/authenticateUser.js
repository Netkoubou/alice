'use strict';

module.exports = function(req, res) {
    var account    = req.body.account;
    var passphrase = req.body.passphrase;

    if (account === 'm-perry' && passphrase === 'jesus') {
        res.json({
            status: 0,
            user: {
                is_privileged: false,
                is_admin:      false,
                is_medical:    false,
                is_urgency:    false,
                is_approval:   false
            }
        });
    } else if (account === 't-harris' && passphrase === 'jesus') {
        res.json({
            status: 0,
            user: {
                is_privileged: true,
                is_admin:      true,
                is_medical:    false,
                is_urgency:    false,
                is_approval:   true
            }
        });
    } else if (account === 'j-mung' && passphrase === 'jesus') {
        res.json({
            status: 0,
            user: {
                is_privileged: false,
                is_admin:      false,
                is_medical:    true,
                is_urgency:    true,
                is_approval:   false
            }
        });
    } else {
        res.json({ status: 1 });
    }
};
