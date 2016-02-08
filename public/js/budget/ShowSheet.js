'use strict';
var React          = require('react');
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Popover        = require('react-bootstrap').Popover;
var XHR            = require('superagent');
var moment         = require('moment');
var Select         = require('../components/Select');
var TableFrame     = require('../components/TableFrame');
var Messages       = require('../lib/Messages');

var Cell = React.createClass({
    propTypes: {
        id:       React.PropTypes.string.isRequired,
        budget:   React.PropTypes.number.isRequired,
        income:   React.PropTypes.number.isRequired,
        outgo:    React.PropTypes.number.isRequired
    },

    render: function() {
        var rate        = this.props.outgo / this.props.budget * 100;
        var rate_string = rate.toLocaleString('ja-JP', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });
        var popover = <Popover id={this.props.id} title="執行率">
                        {rate_string + ' %'}
                      </Popover>;
                      
        return (
            <div ref="showSheetCell">
              <div className="show-sheet-income">
                {this.props.income.toLocaleString()}
              </div>
              <OverlayTrigger contaner={this.refs.showSheetCell}
                              placement="top"
                              overlay={popover}>
                <div className="show-sheet-outgo">
                  {this.props.outgo.toLocaleString()}
                </div>
              </OverlayTrigger>
            </div>
        );
    }
});

var ExpenseRatio = React.createClass({
    propTypes: {
        sums: React.PropTypes.arrayOf(React.PropTypes.shape({
            income: React.PropTypes.number.isRequired,
            outgo:  React.PropTypes.number.isRequired
        }) )
    },

    render: function() {
        var sum_of_incomes = 0;
        var sum_of_outgoes = 0;

        var cols = []
        var tds  = this.props.sums.map(function(s) {
            var ratio = (s.outgo / s.income * 100).toLocaleString('ja-JP', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });

            sum_of_incomes += s.income;
            sum_of_outgoes += s.outgo;

            cols.push(<col key={Math.random()}></col>);
            return (
                <td className="show-sheet-expense-ratios-td"
                    key={Math.random()}>
                  {ratio + " %"}
                </td>
            );
        });

        var total_ratio        = sum_of_outgoes / sum_of_incomes * 100;
        var total_ratio_string = total_ratio.toLocaleString('ja-JP', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });

        cols.unshift(<col key={Math.random()}></col>);
        tds.unshift(
            <td className="show-sheet-expense-ratios-td" key={Math.random()}>
              経費率
            </td>
        );

        cols.push(<col key={Math.random()}></col>);
        tds.push(
            <td id="show-sheet-expense-ratios-td-tail" key={Math.random()}>
              {total_ratio_string + " %"}
            </td>
        );
        cols.push(<col key={Math.random()}></col>);
        tds.push( <td key={Math.random()}> </td>);

        return (
            <table id="show-sheet-expense-ratios">
              <colgroup>
                {cols}
              </colgroup>
              <tbody>
                <tr>{tds}</tr>
              </tbody>
            </table>
        );
    }
});

var ShowSheet = React.createClass({
    getInitialState: function() {
        return {
            year:                '',
            budgets_and_incomes: [],
            outgoes:             []
        };
    },

    onSelectYear: function(e) {
        var year = parseInt(e.code);
        var errmsg_idx;

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
                    outgoes:             res1.body.outgoes
                });

                window.info = {
                    year:                year,
                    budgets_and_incomes: res0.body.budgets_and_incomes,
                    outgoes:             res1.body.outgoes
                };

                window.open('income-and-outgo-graph.html', '収支グラフ');
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
            { income: 0, outgo: 0 }, //  4 月
            { income: 0, outgo: 0 }, //  5 月
            { income: 0, outgo: 0 }, //  6 月
            { income: 0, outgo: 0 }, //  7 月
            { income: 0, outgo: 0 }, //  8 月
            { income: 0, outgo: 0 }, //  9 月
            { income: 0, outgo: 0 }, // 10 月
            { income: 0, outgo: 0 }, // 11 月
            { income: 0, outgo: 0 }, // 12 月
            { income: 0, outgo: 0 }, //  1 月
            { income: 0, outgo: 0 }, //  2 月
            { income: 0, outgo: 0 }, //  3 月
        ];
    },

    render: function() {
        var select_options = [];
        var now            = moment();
        var this_year      = (now.month() < 2)? now.year() - 1: now.year();

        for (var year = 2015; year <= this_year; year++) {
            var year_string = year.toString();

            select_options.push({
                code: year_string,
                name: year_string + ' 年度'
            });
        }

        var sums = this.initSums(); // 各月の収支の合計
        var data = this.state.budgets_and_incomes.map(function(bai, row_idx) {
            var row            = [];
            var sum_of_incomes = 0;
            var sum_of_outgoes = 0;;

            row.push({
                value: bai.department_name,
                view:  bai.department_name
            });
            
            row.push({
                value: bai.budget,
                view:  bai.budget.toLocaleString()
            });

            var outgoes = this.state.outgoes.filter(function(o) {
                return bai.department_code === o.department_code;
            });

            for (var i = 0; i < 12; i++) {
                var outgo = (outgoes.length == 1)? outgoes[0].outgoes[i]: 0;

                if (outgo === undefined) {
                    console.log("i = " + i.toString() );
                    console.log(outgoes[0]);
                }

                row.push({
                    value: '',
                    view:  <Cell id={row_idx.toString() + '-' + i.toString()}
                                 budget={bai.budget}
                                 income={bai.incomes[i]}
                                 outgo={outgo} />
                });

                sum_of_incomes += bai.incomes[i];
                sums[i].income += bai.incomes[i];
                sum_of_outgoes += outgo;
                sums[i].outgo  += outgo;
            }

            row.push({
                value: '',
                view:  <Cell id={row_idx.toString() + '-sum'}
                             budget={bai.budget}
                             income={sum_of_incomes}
                             outgo={sum_of_outgoes} />
            });

            var remains = bai.budget - sum_of_outgoes;

            row.push({
                value: remains,
                view:  remains.toLocaleString()
            });

            return row;
        }.bind(this) );

        return (
            <div id="show-sheet" ref="showSheet">
              <div id="show-sheet-select">
                <Select placeholder="年度を選択して下さい"
                        onSelect={this.onSelectYear}
                        value={this.state.year.toString()}
                        options={select_options} />
              </div>
              <TableFrame id="show-sheet-table"
                          title={this.makeTableTitle()}
                          data={data} />
              <ExpenseRatio sums={sums} />
            </div>
        );
    }
});

module.exports = ShowSheet;
