'use strict';
var fs = require('fs');

module.exports = function(req, res) {
    fs.writeFile('local/data/message.txt', req.body.message, function(err) {
        if (err == null) {
            res.json({ status: 0 });
        } else {
            res.json({ status: 255 });
        }
    });
};
