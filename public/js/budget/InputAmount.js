'use strict';
var React      = require('react');
var Button     = require('react-bootstrap').Button;
var XHR        = require('superagent');
var moment     = require('moment');
var Select     = require('../components/Select');
var TableFrame = require('../components/TableFrame');
var Messages   = require('../lib/Messages');

var InputAmount = React.createClass({
    getInitialState: function() {
        return {
            year:                '',
            budgets_and_incomes: []
        }
    },

    onSelectYear: function(e) {
        var year = parseInt(e.code);

        XHR.post('/collectBudgetsAndIncomes').send({
            year: year
        }).end(function(err, res) {
            var errmsg_idx = 'INPUT_AMOUNT_COLLECT_BUDGETS_AND_INCOMES';

            if (err) {
                alert(Messages.ajax[errmsg_idx]);
                throw 'ajax_collectBudgetsAndIncomes';
            }

            if (res.body.status != 0) {
                alert(Messages.server[errmsg_idx]);
                throw 'server_collectBudgetsAndIncomes';
            }

            this.setState({
                year:                year,
                budgets_and_incomes: res.body.budgets_and_incomes
            });
        }.bind(this) );
    },

    onChangeBudget: function(index) {
        return function(amount) {
            this.state.budgets_and_incomes[index].budget = amount;
            this.setState({
                budgets_and_incomes: this.state.budgets_and_incomes
            });
        }.bind(this);
    },

    onChangeIncome: function(index, month) {
        return function(amount) {
            this.state.budgets_and_incomes[index].incomes[month] = amount;
            this.setState({
                budgets_and_incomes: this.state.budgets_and_incomes
            });
        }.bind(this);
    },

    onBook: function() {
        var tab = this.state.budgets_and_incomes.map(function(bai) {
            return {
                department_code: bai.department_code,
                budget:          bai.budget,
                incomes:         bai.incomes
            };
        });

        XHR.post('/bookBudgetsAndIncomes').send({
            year:                this.state.year,
            budgets_and_incomes: tab
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.INPUT_AMOUNT_BOOK_BUDGETS_AND_INCOMES);
                throw 'ajax_bookDepartmentBudgets';
            }

            if (res.body.status > 0) {
                alert(Messages.server.INPUT_AMOUNT_BOOK_BUDGETS_AND_INCOMES);
                throw 'server_bookDepartmentBudgets';
            }

            alert('記録しました');
        }.bind(this) );
    },

    render: function() {
        var select_options = [];
        var now            = moment();
        var this_year      = (now.month() < 3)? now.year() - 1: now.year();

        for (var year = 2015; year <= this_year; year++) {
            var year_string = year.toString();

            select_options.push({
                code: year_string,
                name: year_string + ' 年度'
            });
        }

        var title = [
            { name: '部門診療科', type: 'string' },
            { name: '予算額',     type: 'number' },
            { name:  '4 月',      type: 'number' },
            { name:  '5 月',      type: 'number' },
            { name:  '6 月',      type: 'number' },
            { name:  '7 月',      type: 'number' },
            { name:  '8 月',      type: 'number' },
            { name:  '9 月',      type: 'number' },
            { name: '10 月',      type: 'number' },
            { name: '11 月',      type: 'number' },
            { name: '12 月',      type: 'number' },
            { name:  '1 月',      type: 'number' },
            { name:  '2 月',      type: 'number' },
            { name:  '3 月',      type: 'number' }
        ];

        var data = this.state.budgets_and_incomes.map(function(bai, index) {
            var row = [
                {
                    value: bai.department_name,
                    view:  bai.department_name
                },
                {
                    value: bai.budget,
                    view:  <TableFrame.Input
                             placeholder={bai.budget.toLocaleString()}
                             onChange={this.onChangeBudget(index)}
                             type="int" />
                }
            ];


            /*
             * 以下、month は実際の月の数 -1 であることに注意。
             * つまり 1 月は 0, 12 月は 11。
             */
            bai.incomes.forEach(function(income, month) {
                row.push({
                    value: income,
                    view:  <TableFrame.Input
                             placeholder={income.toLocaleString()}
                             onChange={this.onChangeIncome(index, month)}
                             type="int" />
                });
            }.bind(this) );

            return row;
        }.bind(this) );

        return (
            <div id="input-amount">
              <div id="input-amount-select">
                <Select placeholder="年度を選択して下さい"
                        onSelect={this.onSelectYear}
                        value={this.state.year.toString()}
                        options={select_options} />
              </div>
              <TableFrame id="input-amount-table"
                          title={title}
                          data={data} />
              <Button id="input-amount-button"
                      bsStyle="primary"
                      bsSize="large"
                      onClick={this.onBook}>
                記録
              </Button>
            </div>
        );
    }
});

module.exports = InputAmount;
