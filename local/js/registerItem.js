'use strict';
var bcrypt   = require('bcrypt');
var log4js   = require('log4js');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[registerItem] invalid session.');
        return;
    }

    util.query(function(db) {
        var collection = req.body.target.toLowerCase();
        var document   = req.body.document;

        document.is_alive = true;

        db.collection(collection).insertOne(document, function(err, result) {
            var msg;

            db.close();

            if (err == null) {
                res.json({
                    status: 0,
                    code:   result.insertedId
                });

                msg = '[registerItem] registered into collection: "' +
                      collection + '" by "' + req.session.user.account + '".';

                log_info.info(msg);
            } else {
                res.json({ status: 255 });
                log_warn.warn(err);

                msg = '[registerItem] ' + 
                      'failed to register into collection: "' +
                      collection + '" by "' + req.session.user.account + '".';

                log_warn.warn(msg);
            }                
        });
    });
};
