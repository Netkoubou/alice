'use strict';
var log4js   = require('log4js');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');

module.exports = function(collection_name) {
    return function(req, res) {
        if (req.session.user == null) {
            res.json({ status: 255 });
            log_warn.warn('[tellAll] invalid session.');
            return;
        }
    
        util.query(function(db) {
            db.collection(collection_name).find({
                is_alive: true
            }).toArray(function(err, documents) {
                if (err != null) {
                    db.close();
                    res.json({ status: 255 });
                    log_warn.warn(err);
    
                    var msg = '[tellAll] ' + 'failed to access "' +
                              collection_name + '" collection.';
    
                    log_warn.warn(msg);
                } else {
                    var response = { status: 0 };

                    response[collection_name] = documents.map(function(d) {
                        d.code = d._id;

                        delete d._id;
                        delete d.is_alive;

                        return d;
                    });

                    res.json(response);
                }
            });
        });
    };
};
