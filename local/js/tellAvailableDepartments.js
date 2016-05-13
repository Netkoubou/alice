'use strict';
var ObjectID = require('mongodb').ObjectID;
var log4js   = require('log4js');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');

function retrieve_departments(req, res, db) {
    var is_already_sent    = false;
    var department_counter = 0;
    var departments        = req.session.user.departments;
    var response           = [];

    function retrieve_department_name(department_code) {
        db.collection('departments').find({
            is_alive: true,
            _id:      new ObjectID(department_code)
        }).limit(1).next(function(err, department) {
            if (is_already_sent) {
                return;
            }

            var msg;

            if (err == null && department != null) {
                response.push({
                    code: department_code,
                    name: department.name
                });
            } else if (department == null) {
                msg = '[tellAvailableDepartments] ' +
                      '"' + req.session.user.account + '" belongs ' +
                      'invalid department: ' + department_code + '".';

                log_info.info(msg);
            } else {
                db.close();
                res.json({ status: 255 });
                is_already_sent = true;

                log_warn.warn(err);

                msg = '[tellAvailableDepartments] ' +
                      'failed to access "departments" collection.';

                log_warn.warn(msg);
                return;
            }

            department_counter++;

            if (department_counter == departments.length) {
                res.json({
                    status: 0,
                    departments: response
                });

                is_already_sent = true;
                db.close();
            }
        });
    }

    departments.forEach(function(d) {
        if (is_already_sent) {
            return;
        }

        if (!d.administrate) {
            department_counter++;

            if (department_counter == departments.length) {
                res.json({
                    status: 0,
                    departments: response
                });

                is_already_sent = true;
                db.close();
            }

            return;
        }

        retrieve_department_name(d.code);
    });
}

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[tellAvailableDepartments] invalid session.');
        return;
    }

    util.query(function(db) {
        if (req.session.user.privileged.administrate) {
            /*
             * 全部門診療科
             */
            db.collection('departments').find({
                is_alive: true
            }).toArray(function(err, departments) {
                if (err != null) {
                    db.close();
                    res.json({ status: 255 });
                    log_warn.warn(err);

                    var msg = '[tellAvailableDepartments] ' +
                              'failed to access "departments" collection.';

                    log_warn.warn(msg);
                } else {
                    res.json({
                        status:      0,
                        departments: departments.map(function(d) {
                            return { code: d._id, name: d.name };
                        })
                    });
                }
            });
        } else {
            /*
             * ログインしているユーザの所属する部門診療科の中で、
             * administrate ビットが立っているもの
             */
            retrieve_departments(req, res, db);
        }
    });
};
