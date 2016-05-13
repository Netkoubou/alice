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
        log_warn.warn('[updateItem] invalid session.');
        return;
    }

    util.query(function(db) {
        var collection = req.body.target.toLowerCase();

        req.body.item.is_alive = true;

        db.collection(collection).replaceOne(
            { _id: new ObjectID(req.body.code) },
            req.body.item,
            function(err, result) {
                var msg;
                db.close();
    
                if (err == null) {
                    res.json({ status: 0 });
    
                    msg = '[updateItem] updated item in "' + collection +
                          '" by "' + req.session.user.account + '".';
    
                    log_info.info(msg);
                } else {
                    res.json({ status: 255 });
                    log_warn.warn(err);
    
                    msg = '[updateItem] failed to update item in "' +
                          collection + '" by "' +
                          req.session.user.account + '".';
    
                    log_warn.warn(msg);
                }
            }
        );
    });
};
