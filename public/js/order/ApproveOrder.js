/*
 * 承認権限を持ったユーザが、発注を承認若しくは否認するためのページ。
 * 但し、承認権限が *ない* ユーザにとっては、発注を「承認待ち」から「依頼中」へ
 * 引き戻すためのページになる。
 * 一部の表示がちょっと違うだけだし、分けるのも面倒なので共通としちゃった。
 */
'use strict';
var React      = require('react');
var Input      = require('react-bootstrap').Input;
var Button     = require('react-bootstrap').Button;
var XHR        = require('superagent');
var TableFrame = require('../components/TableFrame');
var Notice     = require('../components/Notice');
var Util       = require('../lib/Util');

var ApproveOrder = React.createClass({
    propTypes: {
        user:   React.PropTypes.object.isRequired,
        order:  React.PropTypes.object.isRequired,
        goBack: React.PropTypes.func.isRequired,
    },

    getInitialState: function() {
        return {
            order_remark: this.props.order.order_remark,
        }
    },

    onChangeRemark: function(e) {
        this.setState({ order_remark: e.target.value });
    },

    changeOrderState: function(order_state) {
        XHR.post('changeOrderState').send({
            order_code:   this.props.order.order_code,
            order_state:  order_state,
            order_remark: this.state.order_remark
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.APPROVE_CHANGE_ORDER_STATE);
                throw 'ajax_changeOrderState';
            }

            if (res.body.status != 0) {
                alert(Messages.server.APPROVE_CHANGE_ORDER_STATE);
                throw 'server_changeOrderState';
            }

            alert('完了しました');
            this.props.goBack();
        }.bind(this) );
    },

    approveOrder: function() {
        if (confirm('この発注を承認します。よろしいですか?') ) {
            this.changeOrderState('APPROVED');
        }
    },

    denyOrder: function() {
        if (confirm('この発注を *否認* します。よろしいですか?') ) {
            this.changeOrderState('REQUESTING');
        }
    },

    backToRequesting: function() {
        if (confirm('この発注を「依頼中」に引き戻します。よろしいですか?') ) {
            this.changeOrderState('REQUESTING');
        }
    },

    render: function() {
        var title = [
            { name: '品名',     type: 'string' },
            { name: '製造元',   type: 'string' },
            { name: '最安単価', type: 'number' },
            { name: '現在単価', type: 'number' },
            { name: '最高単価', type: 'number' },
            { name: '数量',     type: 'number' },
            { name: '発注小計', type: 'number' },
            { name: '請求額',   type: 'number' },
            { name: '状態',     type: 'string' }
        ];

        var order_total   = 0.0;
        var billing_total = 0.0;

        var data = this.props.order.products.map(function(product) {
            var min_price_string = product.min_price.toLocaleString('ja-JP', {
                minimunFractionDigits: 2
            });

            var cur_price_string = product.cur_price.toLocaleString('ja-JP', {
                minimunFractionDigits: 2
            });

            var max_price_string = product.max_price.toLocaleString('ja-JP', {
                minimunFractionDigits: 2
            });

            var subtotal = product.cur_price * product.quantity;

            order_total   += subtotal;
            billing_total += product.billing_amount;

            var subtotal_string = subtotal.toLocaleString('ja-JP', {
                minimunFractionDigits: 2
            });

            var state_string = Util.toProductStateName(product.state);

            return [
                { value: product.name,      view: product.name     },
                { value: product.maker,     view: product.maker    },
                { value: product.min_price, view: min_price_string },
                { value: product.cur_price, view: cur_price_string },
                { value: product.max_price, view: max_price_string },
                {
                    value: product.quantity, 
                    view:  product.quantity.toLocaleString()
                },
                { value: subtotal, view: subtotal_string },
                {
                    value: product.billing_amount,
                    view:  product.billing_amount.toLocaleString()
                },
                { value: product.state, view: state_string }
            ];
        }.bind(this) );

        var legend;
        var buttons;

        if (this.props.user.is_approval) {
            legend = '承認';
            buttons = (
                <div id="order-approve-buttons">
                  <Button bsSize="small" onClick={this.approveOrder}>
                    承認
                  </Button>
                  <Button bsSize="small" onClick={this.denyOrder}>
                    否認 
                  </Button>
                </div>
            );
        } else {
            legend = '引き戻し?';
            buttons = (
                <div id="order-approve-buttons">
                  <Button bsSize="small" onClick={this.backToRequesting}>
                    引き戻し
                  </Button>
                </div>
            );
        }

        return (
            <div id="order-approve">
              <fieldset> 
                <legend>{legend}</legend>
                <div id="order-approve-infos">
                  <Notice className="order-approve-info" title="起案番号">
                  {this.props.order.order_code}
                  </Notice>
                  <Notice className="order-approve-info" title="起案日">
                    {this.props.order.drafting_date}
                  </Notice>
                  <Notice className="order-approve-info" title="起案者">
                    {this.props.order.drafter_account}
                  </Notice>
                  <Notice className="order-approve-info" title="発注区分">
                    {Util.toOrderTypeName(this.props.order.order_type)}
                  </Notice>
                  <Notice className="order-approve-info"
                          title="発注元 部門診療科">
                    {this.props.order.department_name}
                  </Notice>
                  <Notice id="order-approve-trader" title="発注先 販売元">
                    {this.props.order.trader_name}
                  </Notice>
                </div>
                <Input id="order-approve-remark"
                       type="text"
                       bsSize="small"
                       placeholder="備考・連絡"
                       value={this.state.order_remark}
                       onChange={this.onChangeRemark} />
              </fieldset>
              <TableFrame id="order-approve-products"
                          title={title}
                          data={data}/>
              <div id="order-approve-totals">
                <Notice className="order-approve-total" title="発注総計">
                  {Math.round(order_total).toLocaleString()}
                </Notice>
                <Notice className="order-approve-total" title="請求総計">
                  {Math.round(billing_total).toLocaleString()}
                </Notice>
              </div>
              {buttons}
            </div>
        );
    }
});

module.exports = ApproveOrder;
