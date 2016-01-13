'use strict';
var ObjectID = require('mongodb').ObjectID;
var log4js   = require('log4js');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('waning');
var log_crit = log4js.getLogger('critical');

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[bookBudgetsAndIncomes] invalid session.');
        return;
    }

    util.query(function(db) {
        function upsertBudgetAndIncomes(index) {
            if (index >= req.body.budgets_and_incomes.length) {
                res.json({ status: 0 });
                return;
            }

            var budget_and_incomes = req.body.budgets_and_incomes[index];
            var department_code    = budget_and_incomes.department_code;

            db.collection('budgets_and_incomes').updateOne(
                {
                    year:            req.body.year,
                    department_code: new ObjectID(department_code)
                },
                {
                    year:            req.body.year,
                    department_code: new ObjectID(department_code),
                    budget:          budget_and_incomes.budget,
                    incomes:         budget_and_incomes.incomes
                },
                { upsert: true },
                function(err, result) {
                    if (err == null) {
                        upsertBudgetAndIncomes(index + 1);
                    } else {
                        db.close();
                        res.json({ status: 255 });
                        log_warn.warn(err);

                        var msg = '[bookBudgetsAndIncomes] ' +
                                  'failed to upsert into ' +
                                  '"budgets_and_incomes" collection.';

                        log_warn.warn(msg);
                    }
                }
            );
        }

        upsertBudgetAndIncomes(0);
    });
};
