'use strict';

module.exports = function(req, res) {
    console.log(req.body);
    res.json({ status: 0, order_code: '0893' });
};
