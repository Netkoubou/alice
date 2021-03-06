'use strict';
var React      = require('react');
var Input      = require('react-bootstrap').Input;
var Button     = require('react-bootstrap').Button;
var DatePicker = require('react-datepicker');
var moment     = require('moment');
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
            reason:     '',
            remark:     this.props.cost.cost_remark,
            breakdowns: this.props.cost.breakdowns.map(function(b) {
                return b;
            }),
            fixed_date: moment()
        }
    },

    onChangeFixedDate: function(date) { this.setState({ fixed_date: date }); },

    onFix: function(final_state) {
        XHR.post('/fixCost').send({
            cost_id:     this.props.cost.cost_id,   // 不要
            cost_code:   this.props.cost.cost_code,
            cost_remark: this.state.reason + this.state.remark,
            cost_state:  final_state,
            fixed_date:  this.state.fixed_date.format('YYYY/MM/DD')
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.PROCESS_COST_FIX_COST);
                throw 'ajax_fixCost';
            }

            if (res.body.status > 0) {
                alert(Messages.server.PROCESS_COST_FIX_COST);
                throw 'server_fixCost';
            }

            alert('更新しました。');
            this.props.goBack();
        }.bind(this) );
    },

    onApprove: function() { this.onFix('APPROVED'); },
    onReject:  function() { this.onFix('REJECTED'); },

    onUpdate: function() {
        XHR.post('updateCost').send({
            cost_code:          this.props.cost.cost_code,
            account_title_code: this.props.cost.account_title_code,
            cost_remark:        this.state.remark,
            breakdowns:         this.state.breakdowns
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.PROCESS_COST_UPDATE_COST);
                throw 'ajax_updateCost';
            }

            if (res.body.status > 0) {
                alert(Messages.server.PROCESS_COST_UPDATE_COST);
                throw 'server_updateCost';
            }

            alert('更新しました。');
        });
    },

    onChangeNote: function(index) {
        return function(value) {
            this.state.breakdowns[index].note = value;
            this.setState({ breakdowns: this.state.breakdowns });
        }.bind(this);
    },

    onChangeDate: function(index) {
        return function(date) {
            this.state.breakdowns[index].date = date.format('YYYY/MM/DD');
            this.setState({ breakdowns: this.state.breakdowns });
        }.bind(this);
    },

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

    composeTableFrameDataRow: function(breakdown, index) {
        var subtotal   = breakdown.quantity * breakdown.price;
        var permission = this.decidePermission();
        var account    = this.props.user.account;
        var date;
        var note;

        if (permission === 'REFER_ONLY' && account === 'inmu') {
            date = (
                <TableFrame.DatePicker
                  selected={moment(breakdown.date, 'YYYY/MM/DD')}
                  onChange={this.onChangeDate(index)} />
            );

            note = (
                <TableFrame.Input placeholder={breakdown.note}
                                  onChange={this.onChangeNote(index)}
                                  type="string" />
            );
        } else {
            date = breakdown.date;
            note = breakdown.note;
        }

        return [
            {
                view:  date,
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
                view:  note,
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

        /*
         * 院務部のアカウント inmu は、全部門診療科の経費申請を参照できるが、
         * 変更はできない特殊なユーザ。
         * 手っ取り早く実現するため、inmu に privileged.approve を与え、
         * 全部門診療科の経費申請の一覧を取得できるようにする。
         * ただ、そのままだと経費申請を承認 / 却下できてしまうため、
         * 
         *   user.account === 'inmu'
         *
         * をマジックナンバーとして扱い、その場合だけ特別に
         * 
         *   permission = 'REFER_ONLY'
         *
         * として、承認 / 却下できなくする。
         * 最低最悪の adhock hack だが、仕方ない ...
         */

        if (this.props.user.account === 'inmu') {
            return 'REFER_ONLY';
        }

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

    onPrint: function() {
        var cost    = this.props.cost;
        var drafter = cost.drafter_name + ' (' + cost.drafter_account + ')';

        window.info = {
            drafter:       drafter,
            cost_code:     cost.cost_code,
            drafting_date: cost.drafting_date,
            department:    cost.department_name,
            account_title: cost.account_title_name,
            breakdowns:    cost.breakdowns
        };

        window.open(
            'preview-cost-application.html',
            '経費精算申請書 印刷プレビュー'
        );
    },

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
            ];

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
                         onChange={this.onChangeRemark} />
                </div>
            );
        } else if (this.props.user.account === 'inmu') {
            legend  = '購入日 / コメント編集';
            buttons = [
                <Button key="3"
                        bsStyle="primary"
                        bsSize="large"
                        className="process-cost-button"
                        onClick={this.onUpdate}>
                  更新
                </Button>,
            ];

            remark  = <Input id="process-cost-disabled-remark"
                             type="text"
                             bsSize="small"
                             placeholder="備考・連絡"
                             value={this.state.remark}
                             onChange={this.onChangeRemark} />
        } else {
            legend  = '参照';
            buttons = null;
            remark  = <Input id="process-cost-disabled-remark"
                             type="text"
                             bsSize="small"
                             placeholder="備考・連絡"
                             value={this.state.remark}
                             disabled={true} />
        }

        var total_quantity = 0;
        var total          = 0;

        var table_title = this.makeTableFrameTitle();
        var table_data  = this.state.breakdowns.map(function(b, i) {
            total_quantity += b.quantity;
            total          += b.quantity * b.price;
            return this.composeTableFrameDataRow(b, i);
        }.bind(this) );

        var fixed_date;
        var cost_state = this.props.cost.cost_state;

        if (cost_state === 'APPROVING' && permission === 'APPROVE') {
            var selected_date = moment(this.state.fixed_date, 'YYYY/MM/DD');

            fixed_date = (
                <TableFrame.DatePicker selected={selected_date}
                                       onChange={this.onChangeFixedDate} />
            );
        } else if (this.props.cost.fixed_date === '') {
            fixed_date = '未承認です';
        } else {
            fixed_date = this.props.cost.fixed_date;
        }

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
              <Notice id="process-cost-total-quantity" title="総数">
                {total_quantity.toLocaleString()}
              </Notice>
              <Notice id="process-cost-total" title="合計">
                {total.toLocaleString()}
              </Notice>
              <Notice id="process-cost-fixed-date" title="承認日">
                {fixed_date}
              </Notice>
              <div id="process-cost-buttons">
                <Button bsStyle="primary"
                        bsSize="large"
                        className="process-cost-button"
                        onClick={this.onPrint}>
                  印刷
                </Button>
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
