'use strict';
var ObjectID = require('mongodb').ObjectID;
var log4js   = require('log4js');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');

function generateSelector(user, args) {
    var sel = { '$and': [{
        drafting_date: {
            '$gte': args.start_date,
            '$lte': args.end_date
        }
    }]};

    var state_sel = [];

    if (args.is_approving) {
        state_sel.push({ state: 'APPROVING' });
    }

    if (args.is_approved) {
        state_sel.push({ state: 'APPROVED' });
    }

    if (args.is_rejected) {
        state_sel.push({ state: 'REJECTED' });
    }

    if (state_sel.length > 0) {
        sel['$and'].push({ '$or': state_sel });
    }

    if (!user.privileged.approve) {
        var complex_sel = [];

        user.departments.forEach(function(d) {
            if (d.approve) {
                complex_sel.push({ department_code: d.code });
            }
        });

        if (complex_sel.length > 0) {
            complex_sel.push({ drafter_code: user._id });
            sel['$and'].push({ '$or': complex_sel });
        } else {
            sel['$and'].push({ drafter_code: user._id });
        }
    }

    return sel;
}

function construct_response(costs, db, res) {
    var response        = [];
    var cost_count      = 0;
    var is_already_sent = false;

    function pick_infos(mode, cost, index) {
        var id, cursor, next_action;
        var err_msg = '[lookupCosts] failed to find ';

        switch (mode) {
        case 0:
            id     = new ObjectID(cost.drafter_code);
            cursor = db.collection('users').find({ _id: id });

            next_action = function(user) {
                response[index].drafter_account = user.account;
                response[index].drafter_name    = user.name;
                pick_infos(1, cost, index);
            }

            err_msg += 'user: "' + id + '".';
            break;
        case 1:
            id     = new ObjectID(cost.department_code);
            cursor = db.collection('departments').find({ _id: id });

            next_action = function(department) {
                response[index].department_name = department.name;
                pick_infos(2, cost, index);
            }

            err_msg += 'department: "' + id + '".';
            break;
        default:
            id     = new ObjectID(cost.account_title_code);
            cursor = db.collection('account_titles').find({ _id: id });
            
            next_action = function(account_title) {
                response[index].account_title_name = account_title.name;
                cost_count++;

                if (cost_count >= costs.length) {
                    res.json({ status: 0, costs: response });
                    is_already_sent = true;
                    db.close();
                }
            }

            err_msg += 'account_title: "' + id + '".';
            break;
        }

        cursor.limit(1).next(function(err, doc) {
            if (is_already_sent) {
                return;
            }

            if (err == null && doc != null) {
                next_action(doc);
            } else {
                db.close();
                res.json({ status: 255 });
                is_already_sent = true;

                if (err != null) {
                    log_warn.warn(err);
                }

                log_warn.warn(err_msg);
            }
        });
    }

    costs.forEach(function(cost, index) {
        if (is_already_sent) {
            return;
        }

        response[index] = {
            code:               cost.code,
            drafting_date:      cost.drafting_date,
            department_code:    cost.department_code,
            department_name:    '',    // これから埋める
            drafter_code:       cost.drafter_code,
            drafter_account:    '', // これから埋める
            drafter_name:       '', // これから埋める
            account_title_code: cost.account_title_code,
            account_title_name: '', // これから埋める
            remark:             cost.remark,
            state:              cost.state,
            breakdowns:         cost.breakdowns
        };

        pick_infos(0, cost, index);
    });
}

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[lookupCosts] invalid session.');
        return;
    }

    util.query(function(db) {
        var sel = generateSelector(req.session.user, req.body);

        db.collection('costs').find(sel).toArray(function(err, costs) {
            var msg;

            if (err == null) {
                if (costs.length == 0) {
                    res.json({ status: 0, costs: [] });
                } else {
                    construct_response(costs, db, res);
                }
            } else {
                db.close();
                res.json({ status: 255 });
                log_warn.warn(err);

                var msg = '[lookupCosts] ' +
                          'failed to find at "costs" collection.';

                log_warn.warn(msg);
            }
        });
    });
};
