'use strict';
var React      = require('react');
var Input      = require('react-bootstrap').Input;
var Button     = require('react-bootstrap').Button;
var XHR        = require('superagent');
var Notice     = require('../components/Notice');
var Select     = require('../components/Select');
var TableFrame = require('../components/TableFrame');
var Messages   = require('../lib/Messages');
var Util       = require('../lib/Util');

var reasons    = require('./reasons.json');

var CostNotices = React.createClass({
    propTypes: { cost: React.PropTypes.object.isRequired },

    render: function() {
        var drafter_name    = this.props.cost.drafter_name;
        var drafter_account = this.props.cost.drafter_account;

        return (
            <div id="process-cost-notices">
              <Notice className="process-cost-notice" title="起案番号">
                {this.props.cost.cost_code}
              </Notice>
              <Notice className="process-cost-notice" title="起案日">
                {this.props.cost.drafting_date}
              </Notice>
              <Notice className="process-cost-notice"
                      title="申請元 部門診療科">
                {this.props.cost.department_name}
              </Notice>
              <Notice className="process-cost-notice" title="起案者">
                {drafter_name + '(' + drafter_account + ')'}
              </Notice>
              <Notice id="process-cost-account-title" title="勘定科目">
                {this.props.cost.account_title_name}
              </Notice>
            </div>
        );
    }
});

var ProcessCost = React.createClass({
    propTypes: {
        user:   React.PropTypes.object.isRequired,
        cost:   React.PropTypes.object.isRequired,
        goBack: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return {
            reason: '',
            remark: this.props.cost.cost_remark
        }
    },

    onFix: function(final_state) {
        XHR.post('/fixCost').send({
            cost_id:     this.props.cost.cost_id,   // 不要
            cost_code:   this.props.cost.cost_code,
            cost_remark: this.state.reason + this.state.remark,
            cost_state:  final_state
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.PROCESS_COST_FIX_COST);
                throw 'ajax_fixCost';
            }

            if (res.body.status > 0) {
                alert(Messages.server.PROCESS_COST_FIX_COST);
                throw 'server_fixCost';
            }

            alert('更新しました');
            this.props.goBack();
        }.bind(this) );
    },

    onApprove: function() { this.onFix('APPROVED'); },
    onReject:  function() { this.onFix('REJECTED'); },

    onChangeRemark: function(e) {
        this.setState({ remark: e.target.value });
    },

    makeTableFrameTitle: function() {
        return [
            { name: '購入日',      type: 'string' },
            { name: '品名',        type: 'string' },
            { name: '数量',        type: 'number' },
            { name: '単価',        type: 'number' },
            { name: '小計',        type: 'number' },
            { name: '摘要 / 備考', type: 'string' }
        ];
    },

    composeTableFrameDataRow: function(breakdown) {
        var subtotal = breakdown.quantity * breakdown.price;

        return [
            {
                view:  breakdown.date,
                value: breakdown.date
            },
            {
                view:  breakdown.article,
                value: breakdown.article
            },
            {
                view:  breakdown.quantity.toLocaleString(),
                value: breakdown.quantity
            },
            {
                view:  breakdown.price.toLocaleString(),
                value: breakdown.price
            },
            {
                view:  subtotal.toLocaleString(),
                value: subtotal
            },
            {
                view:  breakdown.note,
                value: breakdown.note
            }
        ];
    },

    decidePermission: function() {
        var permission   = 'REFER_ONLY';
        var user         = this.props.user;
        var cost         = this.props.cost;
        var is_approving = (cost.cost_state === 'APPROVING');
        var is_mine      = (user.account === cost.drafter_account);

        if (is_approving && !is_mine) {
            if (user.privileged.approve) {
                permission = 'APPROVE';
            } else {
                user.departments.forEach(function(d) {
                    if (d.code === cost.department_code && d.approve) {
                        permission = 'APPROVE';
                    }
                });
            }
        }

        return permission;
    },

    onSelectReason: function(e) { this.setState({ reason: e.code }); },

    render: function() {
        var permission = this.decidePermission();
        var legend, buttons, remark;

        if (permission === 'APPROVE') {
            legend  = '承認';
            buttons = [
                <Button key="1"
                        bsStyle="primary"
                        bsSize="large"
                        className="process-cost-button"
                        onClick={this.onApprove}>
                  承認
                </Button>,
                <Button key="2"
                        bsStyle="primary"
                        bsSize="large"
                        className="process-cost-button"
                        onClick={this.onReject}>
                  却下
                </Button>
            ]

            var reason_options = reasons.map(function(r, i) {
                return { code: r, name: r };
            });

            reason_options.push({ code: '', name: 'なし' });

            remark = (
                <div>
                  <div id='process-cost-select-reason'>
                    <Select placeholder="コメント"
                            onSelect={this.onSelectReason}
                            value={this.state.reason}
                            options={reason_options} />
                  </div>
                  <Input id="process-cost-remark"
                         type="text"
                         bsSize="small"
                         placeholder="備考・連絡"
                         value={this.state.remark}
                         disabled={permission === 'REFER_ONLY'}
                         onChange={this.onChangeRemark} />
                </div>
            );
        } else {
            legend  = '参照';
            buttons = null;
            remark  = <Input id="process-cost-disabled-remark"
                             type="text"
                             bsSize="small"
                             placeholder="備考・連絡"
                             value={this.state.remark}
                             disabled={true} />;
        }

        var total       = 0;
        var table_title = this.makeTableFrameTitle();
        var table_data  = this.props.cost.breakdowns.map(function(b) {
            total += b.quantity * b.price;
            return this.composeTableFrameDataRow(b);
        }.bind(this) );

        return (
            <div id="process-cost">
              <fieldset>
                <legend>{legend}</legend>
                <CostNotices cost={this.props.cost} />
                {remark}
              </fieldset>
              <TableFrame id="process-cost-breakdowns"
                          title={table_title}
                          data={table_data} />
              <Notice id="process-cost-total" title="合計">
                {total.toLocaleString()}
              </Notice>
              <div id="process-cost-buttons">
                <Button bsStyle="primary"
                        bsSize="large"
                        className="process-cost-button"
                        onClick={this.props.goBack}>
                  戻る
                </Button>
                {buttons}
              </div>
            </div>
        );
    }
});

module.exports = ProcessCost;
