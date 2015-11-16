'use strict';
var ObjectID = require('mongodb').ObjectID;
var log4js   = require('log4js');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('ctitical');

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[pickMenuItemsToApplyCost] invalid session.');
        return;
    }

    util.query(function(db) {
        var departments = [];

        function pick_account_titles() {
            var cursor = db.collection('account_titles').find();

            cursor.toArray(function(err, account_titles) {
                db.close();

                if (err == null && account_titles.length > 0) {
                    res.json({
                        status:         0,
                        departments:    departments,
                        account_titles: account_titles.map(function(doc) {
                            return { code: doc._id, name: doc.name };
                        })
                    });
                } else {
                    res.json({ status: 255 });
                    is_ready_sent = true;

                    if (err != null) {
                        log_warn.warn(err);
                    }

                    msg = '[pickMenuItemsToApplyCost] ' +
                          'failed to access "account_titles" collection.';

                    log_warn.warn(msg);
                }
            });
        }

        function pick_departments() {
            var is_already_sent = false;
            var count           = 0;

            req.session.user.departments.forEach(function(d, i) {
                if (is_already_sent) {
                    return;
                }

                var id     = new ObjectID(d.code);
                var cursor = db.collection('departments').find({ _id: id });

                cursor.limit(1).next(function(err, department) {
                    if (is_already_sent) {
                        return;
                    }

                    if (err == null && department != null) {
                        departments.push({
                            code: department._id,
                            name: department.name
                        });

                        count++;

                        if (count == req.session.user.departments.length) {
                            pick_account_titles();
                        }
                    } else {
                        db.close();
                        res.json({ status: 255 });
                        is_already_sent = true;

                        if (err != null) {
                            log_warn(err);
                        }

                        var msg = '[pickMenuItemsToApplyCost] ' +
                                  'failed to find department: "' + id + '".';

                        log_warn.warn(msg);
                    }
                });
            });
        }

        pick_departments();
    });
};
