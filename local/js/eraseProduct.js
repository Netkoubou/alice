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
        log_warn.warn('[eraseProduct] invalid session.');
        return;
    }

    util.query(function(db) {
        db.collection('products').updateOne(
            { _id: new ObjectID(req.body.code) },
            { '$set' : { is_alive: false } },
            function(err, result) {
                var msg;

                db.close();

                if (err == null) {
                    res.json({ status: 0 });

                    msg = '[eraseProduct] erased product: "' + req.body.code +
                          '" by "' + req.session.user.account + '".';

                    log_info.info(msg);
                } else {
                    res.json({ status: 255 });
                    log_warn.warn(err);

                    msg = '[eraseProduct] failed to erase product: "' +
                          req.body.code + '" ' + 
                          'by "' + req.session.user.account + '".';

                    log_warn.warn(msg);
                }
            }
        );
    });
}
