'use strict';

module.exports = function(req, res) {
    req.session.destroy();
    res.json({ status: 0 });
};
