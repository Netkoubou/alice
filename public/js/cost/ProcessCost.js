'use strict';
var React      = require('react');
var Input      = require('react-bootstrap').Input;
var Button     = require('react-bootstrap').Button;
var XHR        = require('superagent').Button;
var Notice     = require('../components/Notice');
var TableFrame = require('../components/TableFrame');
var Messages   = require('../lib/Messages');
var Util       = require('../lib/Util');

var ProcessCost = React.createClass({
    propTypes: {
        user:   React.PropTypes.object.isRequired,
        cost:   React.PropTypes.object.isRequired,
        goBack: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return { remark: this.props.cost.cost_remark }
    },

    onApprove: function() {
    },

    onReject: function() {
    },

    onChangeRemark: function(e) {
        this.setState({ remark: e.target.value });
    },

    render: function() {
        var permission = 'REFER_ONLY';

        if (this.props.user.account != this.props.cost.drafter_account) {
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

        var legend  = '参照';
        var buttons = null;

        if (permission === 'APPROVE') {
            legend  = '承認';
            buttons = [
                <Button key="1" bsSize="small" onClick={this.onApprove}>
                  承認
                </Button>,
                <Button key="2" bsSize="small" onClick={this.onReject}>
                  却下
                </Button>
            ]
        }


        var drafter_name    = this.props.cost.drafter_name;
        var drafter_account = this.props.cost.drafter_account;
        var total = 0;

        var table_title = [
            { name: '購入日',      type: 'string' },
            { name: '品名',        type: 'string' },
            { name: '数量',        type: 'number' },
            { name: '単価',        type: 'number' },
            { name: '小計',        type: 'number' },
            { name: '摘要 / 備考', type: 'string' }
        ];

        var table_data = this.props.cost.breakdowns.map(function(b) {
            var subtotal = b.quantity * b.price;

            total += subtotal;

            return [
                { view: b.date,                      value: b.date },
                { view: b.article,                   value: b.article },
                { view: b.quantity.toLocaleString(), value: b.quantity },
                { view: b.price.toLocaleString(),    value: b.price },
                { view: subtotal.toLocaleString(),   value: subtotal },
                { view: b.note,                      value: b.note }
            ];
        });

        return (
            <div id="process-cost">
              <fieldset>
                <legend>{legend}</legend>
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
                <Input id="process-cost-remark"
                       type="text"
                       bsSize="small"
                       placeholder="備考・連絡"
                       value={this.state.remark}
                       onChange={this.onChangeRemark} />
              </fieldset>
              <TableFrame id="process-cost-breakdowns"
                          title={table_title}
                          data={table_data} />
              <Notice id="process-cost-total" title="合計">
                {total.toLocaleString()}
              </Notice>
              <div id="process-cost-buttons">
                <Button bsSize="small" onClick={this.props.goBack}>
                  戻る
                </Button>
                {buttons}
              </div>
            </div>
        );
    }
});

module.exports = ProcessCost;
