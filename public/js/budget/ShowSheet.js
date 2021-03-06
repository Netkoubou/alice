'use strict';
var React      = require('react');
var XHR        = require('superagent');
var moment     = require('moment');
var Select     = require('../components/Select');
var TableFrame = require('../components/TableFrame');
var Messages   = require('../lib/Messages');
var configure  = require('../../../common/configure.js');

var Cell = React.createClass({
    propTypes: {
        id:       React.PropTypes.string.isRequired,
        budget:   React.PropTypes.number.isRequired,
        income:   React.PropTypes.number.isRequired,
        orders:   React.PropTypes.number.isRequired,
        costs:    React.PropTypes.number.isRequired
    },

    render: function() {
        var outgo = this.props.orders + this.props.costs;

        var exec_ratio        = outgo / this.props.budget * 100;
        var exec_ratio_string = exec_ratio.toLocaleString('ja-JP', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });

        var expense_ratio        = outgo / this.props.income * 100;
        var expense_ratio_string = expense_ratio.toLocaleString('ja-JP', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });

        return (
            <div>
              <div className="show-sheet-income">
                {this.props.income.toLocaleString()}
              </div>
              <div className="show-sheet-orders">
                {this.props.orders.toLocaleString()}
              </div>
              <div className="show-sheet-costs">
                {this.props.costs.toLocaleString()}
              </div>
              <div className="show-sheet-outgo">
                {outgo.toLocaleString()}
              </div>
              <div className="show-sheet-exec-ratio">
                {exec_ratio_string + ' %'}
              </div>
              <div className="show-sheet-expense-ratio">
                {expense_ratio_string + ' %'}
              </div>
            </div>
        );
    }
});

var Totals = React.createClass({
    propTypes: {
        budgetTotal: React.PropTypes.number.isRequired,
        sums:        React.PropTypes.arrayOf(React.PropTypes.shape({
            income: React.PropTypes.number.isRequired,
            orders: React.PropTypes.number.isRequired,
            costs:  React.PropTypes.number.isRequired
        }) )
    },

    render: function() {
        var sum_of_incomes = 0;
        var sum_of_orders  = 0;
        var sum_of_costs   = 0;

        var tds  = this.props.sums.map(function(s) {
            var outgo = s.orders + s.costs;

            var income_string = s.income.toLocaleString();
            var orders_string = s.orders.toLocaleString();
            var costs_string  = s.costs.toLocaleString();
            var outgo_string  = outgo.toLocaleString();

            var exec_ratio        = outgo / this.props.budgetTotal * 100;
            var exec_ratio_string = exec_ratio.toLocaleString('ja-JP', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });

            var expense_ratio        = outgo / s.income * 100;
            var expense_ratio_string = expense_ratio.toLocaleString('ja-JP', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });

            sum_of_incomes += s.income;
            sum_of_orders  += s.orders;
            sum_of_costs   += s.costs;

            return (
                <td className="show-sheet-totals-td" key={Math.random()}>
                  <div className="show-sheet-income">
                    {income_string}
                  </div>
                  <div className="show-sheet-orders">
                    {orders_string}
                  </div>
                  <div className="show-sheet-costs">
                    {costs_string}
                  </div>
                  <div className="show-sheet-outgo">
                    {outgo_string}
                  </div>
                  <div className="show-sheet-exec-ratio">
                    {exec_ratio_string + ' %'}
                  </div>
                  <div className="show-sheet-expense-ratio">
                    {expense_ratio_string + ' %'}
                  </div>
                </td>
            );
        }.bind(this) );

        var sum_of_outgoes = sum_of_orders + sum_of_costs;

        var income_string = sum_of_incomes.toLocaleString();
        var orders_string = sum_of_orders.toLocaleString();
        var costs_string  = sum_of_costs.toLocaleString(); 
        var outgo_string  = sum_of_outgoes.toLocaleString();

        var exec_ratio        = sum_of_outgoes / this.props.budgetTotal * 100;
        var exec_ratio_string = exec_ratio.toLocaleString('ja-JP', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });

        var expense_ratio        = sum_of_outgoes / sum_of_incomes * 100;
        var expense_ratio_string = expense_ratio.toLocaleString('ja-JP', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });

        tds.unshift(
            <td className="show-sheet-totals-td" key={Math.random()}>
              {this.props.budgetTotal.toLocaleString()}
            </td>
        );

        tds.unshift(
            <td className="show-sheet-totals-td" key={Math.random()}>
              計
            </td>
        );

        tds.push(
            <td className="show-sheet-totals-td" key={Math.random()}>
              <div className="show-sheet-income">
                {income_string}
              </div>
              <div className="show-sheet-orders">
                {orders_string}
              </div>
              <div className="show-sheet-costs">
                {costs_string}
              </div>
              <div className="show-sheet-outgo">
                {outgo_string}
              </div>
              <div className="show-sheet-exec-ratio">
                {exec_ratio_string + ' %'}
              </div>
              <div className="show-sheet-expense-ratio">
                {expense_ratio_string + ' %'}
              </div>
            </td>
        );

        tds.push(
            <td className="show-sheet-totals-td" key={Math.random()}>
              {(this.props.budgetTotal - sum_of_outgoes).toLocaleString()}
            </td>
        );

        return (
            <table id="show-sheet-totals">
              <colgroup>
                <col/><col/><col/><col/><col/><col/><col/><col/>
                <col/><col/><col/><col/><col/><col/><col/><col/>
              </colgroup>
              <tbody>
                <tr>{tds}</tr>
              </tbody>
            </table>
        );
    }
});

var ShowSheet = React.createClass({
    propTypes: { user: React.PropTypes.object.isRequired },

    getInitialState: function() {
        return {
            year:                '',
            budgets_and_incomes: [],
            outgoes:             [],
            is_loading:          false
        };
    },

    onSelectYear: function(e) {
        var year = parseInt(e.code);
        var errmsg_idx;

        this.setState({ is_loading: true });

        XHR.post('/collectBudgetsAndIncomes').send({
            year: year
        }).end(function(err, res0) {
            errmsg_idx = 'SHOW_SHEET_COLLECT_BUDGET_AND_INCOMES';

            if (err) {
                alert(Messages.ajax[errmsg_idx]);
                throw 'ajax_collectBudgetsAndIncomes';
            }

            if (res0.body.status != 0) {
                alert(Messages.server[errmsg_idx]);
                throw 'server_collectBudgetsAndIncomes';
            }

            XHR.post('/computeOutgoes').send({
                year: year
            }).end(function(err, res1) {
                errmsg_idx = 'SHOW_SHEET_COMPUTE_OUTGOES';

                if (err) {
                    alert(Messages.ajax[errmsg_idx]);
                    throw 'ajax_computeOutgoes';
                }

                if (res1.body.status != 0) {
                    alert(Messages.server[errmsg_idx]);
                    throw 'server_computeOutgoes';
                }

                this.setState({
                    year:                year,
                    budgets_and_incomes: res0.body.budgets_and_incomes,
                    outgoes:             res1.body.outgoes,
                    is_loading:          false
                });

                window.info = {
                    year:                year,
                    budgets_and_incomes: res0.body.budgets_and_incomes,
                    outgoes:             res1.body.outgoes
                };

                window.open('income-and-outgo-graph.html', '執行率グラフ');
            }.bind(this) );
        }.bind(this) );
    },

    makeTableTitle: function() {
        return [
            { name: '部門診療科', type: 'string' },
            { name: '予算額',     type: 'number' },
            { name:  '4 月',      type: 'void' },
            { name:  '5 月',      type: 'void' },
            { name:  '6 月',      type: 'void' },
            { name:  '7 月',      type: 'void' },
            { name:  '8 月',      type: 'void' },
            { name:  '9 月',      type: 'void' },
            { name: '10 月',      type: 'void' },
            { name: '11 月',      type: 'void' },
            { name: '12 月',      type: 'void' },
            { name:  '1 月',      type: 'void' },
            { name:  '2 月',      type: 'void' },
            { name:  '3 月',      type: 'void' },
            { name: '合計',       type: 'void' },
            { name: '残額',       type: 'number' }
        ];
    },

    initSums: function() {
        return [
            { income: 0, orders: 0, costs: 0 }, //  4 月
            { income: 0, orders: 0, costs: 0 }, //  5 月
            { income: 0, orders: 0, costs: 0 }, //  6 月
            { income: 0, orders: 0, costs: 0 }, //  7 月
            { income: 0, orders: 0, costs: 0 }, //  8 月
            { income: 0, orders: 0, costs: 0 }, //  9 月
            { income: 0, orders: 0, costs: 0 }, // 10 月
            { income: 0, orders: 0, costs: 0 }, // 11 月
            { income: 0, orders: 0, costs: 0 }, // 12 月
            { income: 0, orders: 0, costs: 0 }, //  1 月
            { income: 0, orders: 0, costs: 0 }, //  2 月
            { income: 0, orders: 0, costs: 0 }, //  3 月
        ];
    },

    render: function() {
        var select_options = [{
            code: configure.YEAR.toString(),
            name: configure.YEAR.toString() + ' 年度'
        }];

        var budget_total = 0;               // 各部門診療科の予算の合計
        var sums         = this.initSums(); // 各月の収支の合計

        var data = this.state.budgets_and_incomes.map(function(bai, row_idx) {
            var row            = [];
            var sum_of_incomes = 0;
            var sum_of_orders  = 0;
            var sum_of_costs   = 0;

            row.push({
                value: bai.department_name,
                view:  bai.department_name
            });

            budget_total += bai.budget;
            
            row.push({
                value: bai.budget,
                view:  bai.budget.toLocaleString()
            });

            var outgoes = this.state.outgoes.filter(function(o) {
                return bai.department_code === o.department_code;
            });

            for (var i = 0; i < 12; i++) {
                var outgo;
                
                if (outgoes.length == 1) {
                    outgo = outgoes[0].outgoes[i];
                } else {
                    outgo = { orders: 0, costs: 0 };
                }

                row.push({
                    value: '',
                    view:  <Cell id={row_idx.toString() + '-' + i.toString()}
                                 budget={bai.budget}
                                 income={bai.incomes[i]}
                                 orders={outgo.orders}
                                 costs={outgo.costs} />
                });

                sum_of_incomes += bai.incomes[i];
                sums[i].income += bai.incomes[i];
                sum_of_orders  += outgo.orders;
                sum_of_costs   += outgo.costs;
                sums[i].orders += outgo.orders;
                sums[i].costs  += outgo.costs;
            }

            row.push({
                value: '',
                view:  <Cell id={row_idx.toString() + '-sum'}
                             budget={bai.budget}
                             income={sum_of_incomes}
                             orders={sum_of_orders}
                             costs={sum_of_costs} />
            });

            var remains = bai.budget - sum_of_orders - sum_of_costs;

            row.push({
                value: remains,
                view:  remains.toLocaleString()
            });

            return row;
        }.bind(this) );

        var totals = null;

        if (this.props.user.privileged.administrate) {
            totals = <Totals budgetTotal={budget_total} sums={sums} />;
        }

        var cursor = this.state.is_loading? "cursor-loading": "cursor-default";

        return (
            <div id="show-sheet" className={cursor}>
              <div id="show-sheet-select">
                <Select placeholder="年度を選択して下さい"
                        onSelect={this.onSelectYear}
                        value={this.state.year.toString()}
                        options={select_options} />
                <span id="show-sheet-legend-label">各月凡例: </span>
                <span className="show-sheet-income show-sheet-legend">
                  収入 (円)
                </span>
                <span className="show-sheet-orders show-sheet-legend">
                  発注 (円)
                </span>
                <span className="show-sheet-costs show-sheet-legend">
                  経費 (円)
                </span>
                <span className="show-sheet-outgo show-sheet-legend">
                  支出 (発注 + 経費) (円)
                </span>
                <span className="show-sheet-exec-ratio show-sheet-legend">
                  執行率 (%)
                </span>
                <span className="show-sheet-expense-ratio show-sheet-legend">
                  経費率 (%)
                </span>
              </div>
              <TableFrame id="show-sheet-table"
                          title={this.makeTableTitle()}
                          data={data} />
              {totals}
            </div>
        );
    }
});

module.exports = ShowSheet;
