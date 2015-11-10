'use strict';
var fs = require('fs');

module.exports = function(req, res) {
    fs.readFile('local/etc/message.txt', 'utf8', function(err, message) {
        if (err == null) {
            res.json({
                status:  0,
                message: message
            });
        } else {
            res.json({ status: 255 });
        }
    });
};
