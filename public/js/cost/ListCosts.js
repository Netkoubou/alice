'use strict';
var React          = require('react');
var Input          = require('react-bootstrap').Input;
var Button         = require('react-bootstrap').Button;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Popover        = require('react-bootstrap').Popover;
var XHR            = require('superagent');
var moment         = require('moment');
var TableFrame     = require('../components/TableFrame');
var CalendarMarker = require('../components/CalendarMarker');
var Messages       = require('../lib/Messages');
var Util           = require('../lib/Util');

var CostCode = React.createClass({
    propTypes: {
        user: React.PropTypes.object.isRequired,

        cost: React.PropTypes.shape({
            code:               React.PropTypes.string.isRequired,
            department_code:    React.PropTypes.string.isRequired,
            department_name:    React.PropTypes.string.isRequired,
            drafting_date:      React.PropTypes.string.isRequired,
            drafter_code:       React.PropTypes.string.isRequired,
            drafter_account:    React.PropTypes.string.isRequired,
            drafter_name:       React.PropTypes.string.isRequired,
            account_title_code: React.PropTypes.string.isRequired,
            account_title_name: React.PropTypes.string.isRequired,
            state:              React.PropTypes.string.isRequired,
            breakdowns:         React.PropTypes.arrayOf(React.PropTypes.shape({
                date:     React.PropTypes.string.isRequired,
                article:  React.PropTypes.string.isRequired,
                quantity: React.PropTypes.number.isRequired,
                price:    React.PropTypes.number.isRequired,
                note:     React.PropTypes.string.isRequired
            }) ).isRequired
        }).isRequired,

        goBack:   React.PropTypes.func.isRequired,
        onSelect: React.PropTypes.func.isRequired
    },

    render: function() {
        return (
            <div>{this.props.cost.code}</div>
        );
    }
});

var ListCosts = React.createClass({
    propTypes: { user: React.PropTypes.object.isRequired },

    getInitialState: function() {
        return {
            start_date:   moment(),
            end_date:     moment(),
            is_approving: false,
            is_approved:  false,
            is_rejected:  false,
            costs:        []
        };
    },

    onMark: function(start_date, end_date) {
        this.setState({
            start_date: start_date,
            end_date:   end_date
        });
    },

    onChangeCheckbox: function() {
        this.setState({
            is_approving: this.refs.approving.getChecked(),
            is_approved:  this.refs.approved.getChecked(),
            is_rejected:  this.refs.rejected.getChecked()
        });
    },

    backToHere: function() {
    },

    onSelect: function() {
    },

    onSearch: function() {
        XHR.post('lookupCosts').send({
            start_date: this.state.start_date.format('YYYY/MM/DD'),
            end_date:   this.state.end_date.format('YYYY/MM/DD'),
            state: {
                is_approving: this.state.is_approving,
                is_approved:  this.state.is_approved,
                is_rejected:  this.state.is_rejected
            }
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.LIST_COSTS_LOOKUP_COSTS);
                throw 'ajax_lookupCosts';
            }

            if (res.body.status != 0) {
                alert(Messages.server.LIST_COSTS_LOOKUP_COSTS);
                throw 'server_lookupCosts';
            }

            var costs = res.body.costs.map(function(cost, index) {
                var state  = Util.toCostStateName(cost.state);
                var total  = 0;
                var remark = '';

                cost.breakdowns.forEach(function(b) {
                    total += b.price * b.quantity;
                });

                if (cost.remark != '') {
                    var id      = 'list-costs-popover' + index.toString();
                    var popover = <Popover id={id} title="備考・連絡">
                                    {cost.remark}
                                  </Popover>;

                    remark = <OverlayTrigger contaner={this.refs.listCosts}
                                             placement="left"
                                             overlay={popover}>
                               <span className="list-costs-remark">!</span>
                             </OverlayTrigger>;
                }

                return [
                    {
                        value: cost.code,
                        view:  <CostCode user={this.props.user}
                                         cost={cost}
                                         goBack={this.backToHere}
                                         onSelect={this.onSelect} />
                    },
                    {
                        value: cost.drafting_date,
                        view:  cost.drafting_date
                    },
                    {
                        value: cost.drafter_name,
                        view:  cost.drafter_name
                    },
                    {
                        value: cost.department_name,
                        view:  cost.department_name
                    },
                    {
                        value: cost.account_title_name,
                        view:  cost.account_title_name
                    },
                    {
                        value: cost.breakdowns[0].article,
                        view:  cost.breakdowns[0].article
                    },
                    { value: total, view:  total.toLocaleString() },
                    { value: state, view:  state },
                    { value: '',    view:  remark, }
                ];
            }.bind(this) );

            this.setState({ costs: costs });
        }.bind(this) );
    },

    render: function() {
        var title = [
            { name: '起案番号',          type: 'string' },
            { name: '起案日',            type: 'string' },
            { name: '起案者',            type: 'string' },
            { name: '申請元 部門診療科', type: 'string' },
            { name: '勘定科目',          type: 'string' },
            { name: '品目',              type: 'string' },
            { name: '総計',              type: 'number' },
            { name: '状態',              type: 'string' },
            { name: '!',                 type: 'void' }
        ];

        return (
            <div id="list-costs" ref="listCosts">
              <fieldset id="list-costs-search">
                <legend>検索</legend>
                <div id="list-costs-calendar-marker">
                  <CalendarMarker startDate={this.state.start_date}
                                  endDate={this.state.end_date}
                                  onMark={this.onMark} />
                </div>
                <div className="list-costs-checkbox">
                  <Input type="checkbox"
                         label="承認待ち"
                         checked={this.state.is_approving}
                         onChange={this.onChangeCheckbox}
                         ref="approving" />
                </div>
                <div className="list-costs-checkbox">
                  <Input type="checkbox"
                         label="承認済み"
                         checked={this.state.is_approved}
                         onChange={this.onChangeCheckbox}
                         ref="approved" />
                </div>
                <div className="list-costs-checkbox">
                  <Input type="checkbox"
                         label="却下"
                         checked={this.state.is_rejected}
                         onChange={this.onChangeCheckbox}
                         ref="rejected" />
                </div>
                <div id="list-costs-buttons">
                  <Button bsSize="small" onClick={this.onSearch}>検索</Button>
                </div>
              </fieldset>
              <fieldset id="list-costs-table-frame">
                <legend>経費精算申請一覧</legend>
                <TableFrame id="list-costs-costs"
                            title={title}
                            data={this.state.costs} />
              </fieldset>
            </div>
        );
    }
});

module.exports = ListCosts;