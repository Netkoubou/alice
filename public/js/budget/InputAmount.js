'use strict';
var React      = require('react');
var Button     = require('react-bootstrap').Button;
var XHR        = require('superagent');
var TableFrame = require('../components/TableFrame');
var Messages   = require('../lib/Messages');

var InputAmount = React.createClass({
    getInitialState: function() { return { budgets: [] } },

    onChangeAmount: function(index) {
        return function(amount) {
            this.state.budgets[index].amount = amount;
            this.setState({ budgets: this.state.budgets });
        }.bind(this);
    },

    onBook: function() {
        XHR.post('/bookDepartmentBudgets').send({
            budgets: this.state.budgets
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.INPUT_AMOUNT_BOOK_DEPARTMENT_BUDGETS);
                throw 'ajax_bookDepartmentBudgets';
            }

            if (res.body.status > 0) {
                alert(Messages.server.INPUT_AMOUNT_BOOK_DEPARTMENT_BUDGETS);
                throw 'server_bookDepartmentBudgets';
            }

            alert('記録しました');
        }.bind(this) );
    },

    componentDidMount: function() {
        XHR.get('/collectDepartmentBudgets').set({
            'If-Modified-Sice': 'Thu, 01 Jan 1970 00:00:00 GMT'
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.INPUT_AMOUNT_COLLECT_DEPARTMENT_BUDGETS);
                throw 'ajax_collectDepartmentBudgets';
            }

            if (res.body.status != 0) {
                alert(Messages.server.INPUT_AMOUNT_COLLECT_DEPARTMENT_BUDGETS);
                throw 'server_collectDepartmentBudgets';
            }

            this.setState({ budgets: res.body.budgets });
        }.bind(this) );
    },

    render: function() {
        var title = [
            { name: '部門診療科', type: 'string' },
            { name: '予算額',     type: 'number' }
        ];

        var data = this.state.budgets.map(function(b, i) {
            return [
                {
                    value: b.department,
                    view:  b.department
                },
                {
                    value: b.amount,
                    view:  <TableFrame.Input placeholder={b.amount.toString()}
                                             onChange={this.onChangeAmount(i)}
                                             type="int" />

                }
            ];
        });

        return (
            <div id="input-amount">
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
