'use strict';

module.exports = function(req, res) {
    console.log(req.body);
    res.json({ status: 0 });
};
