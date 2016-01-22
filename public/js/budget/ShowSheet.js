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
        var rate    = this.props.outgo / this.props.budget * 100;
        var popover = <Popover id={this.props.id} title="執行率">
                        {rate.toString() + ' %'}
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
                    year: year,
                    budgets_and_incomes: res0.body.budgets_and_incomes,
                    outgoes:             res1.body.outgoes
                });
            }.bind(this) );
        }.bind(this) );
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

        var title = [
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

        var data = [
            [
                { value: 'foo',  view: 'foo' },
                { value: '100000', view: '100,000' },
                {
                    value: '1000',
                    view: <Cell id="0-04"
                                budget={100000}
                                income={1000}
                                outgo={100}
                                contaner={this.refs.showSheet} />
                },
                {
                    value: '1000',
                    view: <Cell id="0-05"
                                budget={100000}
                                income={1000}
                                outgo={100}
                                contaner={this.refs.showSheet} />
                },
                {
                    value: '1000',
                    view: <Cell id="0-06"
                                budget={100000}
                                income={1000}
                                outgo={100}
                                contaner={this.refs.showSheet} />
                },
                {
                    value: '1000',
                    view: <Cell id="0-07"
                                budget={100000}
                                income={1000}
                                outgo={100}
                                contaner={this.refs.showSheet} />
                },
                {
                    value: '1000',
                    view: <Cell id="0-08"
                                budget={100000}
                                income={1000}
                                outgo={100}
                                contaner={this.refs.showSheet} />
                },
                {
                    value: '1000',
                    view: <Cell id="0-09"
                                budget={100000}
                                income={1000}
                                outgo={100}
                                contaner={this.refs.showSheet} />
                },
                {
                    value: '1000',
                    view: <Cell id="0-10"
                                budget={100000}
                                income={1000}
                                outgo={100}
                                contaner={this.refs.showSheet} />
                },
                {
                    value: '1000',
                    view: <Cell id="0-11"
                                budget={100000}
                                income={1000}
                                outgo={100}
                                contaner={this.refs.showSheet} />
                },
                {
                    value: '1000',
                    view: <Cell id="0-12"
                                budget={100000}
                                income={1000}
                                outgo={100}
                                contaner={this.refs.showSheet} />
                },
                {
                    value: '1000',
                    view: <Cell id="0-01"
                                budget={100000}
                                income={1000}
                                outgo={100}
                                contaner={this.refs.showSheet} />
                },
                {
                    value: '1000',
                    view: <Cell id="0-02"
                                budget={100000}
                                income={1000}
                                outgo={100}
                                contaner={this.refs.showSheet} />
                },
                {
                    value: '1000',
                    view: <Cell id="0-03"
                                budget={100000}
                                income={1000}
                                outgo={100}
                                contaner={this.refs.showSheet} />
                },
                {
                    value: '12000',
                    view: <Cell id="0-sum"
                                budget={100000}
                                income={12000}
                                outgo={1200}
                                contaner={this.refs.showSheet} />
                },
                { value: '98800', view: '98,800' }
            ]
        ];

        return (
            <div id="show-sheet" ref="showSheet">
              <div id="show-sheet-select">
                <Select placeholder="年度を選択して下さい"
                        onSelect={this.onSelectYear}
                        value={this.state.year.toString()}
                        options={select_options} />
              </div>
              <TableFrame id="show-sheet-table"
                          title={title}
                          data={data} />
            </div>
        );
    }
});

module.exports = ShowSheet;
