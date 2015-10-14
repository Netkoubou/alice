'use strict';
var React      = require('react');
var Input      = require('react-bootstrap').Input;
var Button     = require('react-bootstrap').Button;
var XHR        = require('superagent');
var TableFrame = require('../components/TableFrame');
var Notice     = require('../components/Notice');
var Messages   = require('../lib/Messages');
var Util       = require('../lib/Util');

var SelectProductState = React.createClass({
    propTypes: {
        initialSelected: React.PropTypes.string.isRequired,
        onSelect:        React.PropTypes.func.isRequired
    },

    render: function() {
        return (
            <TableFrame.Select initialSelected={this.props.initialSelected}
                               onSelect={this.props.onSelect}>
              <TableFrame.Option value="UNORDERED">
                未発注
              </TableFrame.Option>
              <TableFrame.Option value="ORDERED">
                発注済み
              </TableFrame.Option>
              <TableFrame.Option value="CANCELED">
                キャンセル
              </TableFrame.Option>
              <TableFrame.Option value="DELIVERED">
                納品済み
              </TableFrame.Option>
            </TableFrame.Select>
        );
    }
});

var ProcessOrder = React.createClass({
    propTypes: {
        user:   React.PropTypes.object.isRequired,
        order:  React.PropTypes.object.isRequired,
        goBack: React.PropTypes.func.isRequired,
    },

    getInitialState: function() {
        var products = this.props.order.products.map(function(p) {
            return {
                code:           p.code,
                name:           p.name,
                maker:          p.maker,
                min_price:      p.min_price,
                cur_price:      p.cur_price,
                max_price:      p.max_price,
                quantity:       p.quantity,
                state:          p.state,
                billing_amount: p.billing_amount
            };
        });

        return {
            order_remark: this.props.order.order_remark,
            products:     products
        };
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

    onApprove: function() {
        if (confirm('この発注を承認します。よろしいですか?') ) {
            this.changeOrderState('APPROVED');
        }
    },

    onDeny: function() {
        if (confirm('この発注を *否認* します。よろしいですか?') ) {
            this.changeOrderState('REQUESTING');
        }
    },

    onRevertToRequesting: function() {
        if (confirm('この発注を「依頼中」に戻します。よろしいですか?') ) {
            this.changeOrderState('REQUESTING');
        }
    },

    onRevertToApproved: function() {
        if (confirm('この発注を「承認済み」に戻します。よろしいですか?') ) {
            this.changeOrderState('APPROVED');
        }
    },

    onFix: function() {
        for (var i = 0; i < this.state.products.length; i++) {
            var p = this.state.products[i];

            if (p.state === 'DELIVERED') {
                var e;

                if (p.cur_price <= 0.0) {
                    alert('現在単価に 0 以下の値を指定することはできません。');
                    var e = this.refs['cur_price' + i.toString()];
                    React.findDOMNode(e).focus();
                    return;
                }

                if (p.billing_amount == 0) {
                    alert('請求額を指定して下さい。');
                    var e = this.refs['billing_amount' + i.toString()];
                    React.findDOMNode(e).focus();
                    return;
                }
            }
        }

        if (confirm('この発注を確定します。よろしいですか?') ) {
            var order_state     = this.props.order.order_state;
            var num_of_products = this.state.products.length;

            var num_of_canceled = this.state.products.filter(function(p) {
                return p.state === 'CANCELED';
            }).length;

            var num_of_delivered = this.state.products.filter(function(p) {
                return p.state === 'DELIVERED';
            }).length;

            if (num_of_products == num_of_canceled) {
                order_state = 'NULLIFIED';
            } else if (num_of_products == num_of_canceled + num_of_delivered) {
                order_state = 'COMPLETED';
            }

            XHR.post('updateOrder').send({
                order_code:      this.props.order.order_code,
                order_state:     order_state,
                order_remark:    this.state.order_remark,
                department_code: this.props.order.department_code,
                trader_code:     this.props.order.trader_code,
                products:        this.state.products.map(function(p) {
                    return {
                        code:     p.code,
                        price:    p.cur_price,
                        quantity: p.quantity,
                        state:    p.state,
                        billing_amount: p.billing_amount
                    };
                })
            }).end(function(err, res) {
                if (err) {
                    alert(Messages.ajax.PROCESS_ORDER_UPDATE_ORDER);
                    throw 'ajax_updateOrder';
                }

                if (res.body.status != 0) {
                    alert(Messages.server.PROCESS_ORDER_UPDATE_ORDER);
                    throw 'server_updateOrder';
                }

                alert('確定しました');
            }.bind(this) );
        }
    },

    onChangeCurPrice: function(index) {
        return function(cur_price) {
            this.state.products[index].cur_price = cur_price;
            this.setState({ products: this.state.products });
        }.bind(this);
    },

    onChangeBillingAmount: function(index) {
        return function(billing_amount) {
            this.state.products[index].billing_amount = billing_amount;
            this.setState({ products: this.state.products });
        }.bind(this);
    },

    onChangeState: function(index) {
        return function(e) {
            if (e.target.value != 'DELIVERED') {
                var original = this.props.order.products[index];
                var current  = this.state.products[index];

                current.cur_price      = original.cur_price;
                current.billing_amount = original.billing_amount;
            }

            this.state.products[index].state = e.target.value;
            this.setState({ products: this.state.products });
        }.bind(this);
    },

    render: function() {
        var order_state = this.props.order.order_state;
        var is_approval = this.props.user.is_approval;
        var permission  = 'REFER_ONLY';

        if (order_state === 'APPROVING') {
            if (is_approval) {
                permission = 'APPROVE';
            } else {
                permission = 'BACK_TO_REQUESTING';
            }
        } else if (!is_approval) {
            if (order_state === 'NULLIFIED' || order_state === 'COMPLETED') {
                permission = 'BACK_TO_APPROVED';
            } else if (order_state === 'APPROVED') {
                permission = 'PROCESS';
            } 
        }

        var table_title = [
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

        var table_data = this.state.products.map(function(product, index) {
            var min_price_view = product.min_price.toLocaleString('ja-JP', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });

            var cur_price_view = product.cur_price.toLocaleString('ja-JP', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });

            var max_price_view = product.max_price.toLocaleString('ja-JP', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });

            var subtotal = product.cur_price * product.quantity;

            if (product.state != 'CANCELED') {
                order_total += subtotal;
            }

            if (product.state === 'DELIVERED') {
                billing_total += product.billing_amount;
            }

            var subtotal_view = subtotal.toLocaleString('ja-JP', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });

            var billing_amount_view = product.billing_amount.toLocaleString();
            var state_view          = Util.toProductStateName(product.state);

            if (permission === 'PROCESS') {
                state_view = (
                    <SelectProductState initialSelected={product.state}
                                        onSelect={this.onChangeState(index)} />
                );

                if (this.props.order.products[index].state === 'ORDERED') {
                    if (product.state === 'DELIVERED') {
                        cur_price_view = (
                            <TableFrame.Input
                              key={Math.random()}
                              type='real'
                              placeholder={cur_price_view}
                              onChange={this.onChangeCurPrice(index)}
                              ref={"cur_price" + index.toString()} />
                        );

                        billing_amount_view = (
                            <TableFrame.Input
                              key={Math.random()}
                              type='int'
                              placeholder={billing_amount_view}
                              onChange={this.onChangeBillingAmount(index)}
                              ref={"billing_amount" + index.toString()} />
                        );
                    }
                }
            }

            return [
                { value: product.name,      view: product.name     },
                { value: product.maker,     view: product.maker    },
                { value: product.min_price, view: min_price_view },
                {
                    value: product.cur_price,
                    view:  cur_price_view
                },
                { value: product.max_price, view: max_price_view },
                {
                    value: product.quantity, 
                    view:  product.quantity.toLocaleString()
                },
                { value: subtotal, view: subtotal_view },
                {
                    value: product.billing_amount,
                    view:  billing_amount_view
                },
                {
                    value: product.state,
                    view:  state_view
                }
            ];
        }.bind(this) );

        var legend;
        var buttons = [
            <Button key="0" bsSize="small" onClick={this.props.goBack}>
              戻る
            </Button>
        ];

        switch (permission) {
        case 'APPROVE':
            legend = '承認';
            buttons.push(
                <Button key="1" bsSize="small" onClick={this.onApprove}>
                  承認
                </Button>
            );
            buttons.push(
                <Button key="2" bsSize="small" onClick={this.onDeny}>
                  否認 
                </Button>
            );

            break;
        case 'BACK_TO_REQUESTING':
            legend = '取り下げ?';
            buttons.push(
                <Button key="3"
                        bsSize="small"
                        onClick={this.onRevertToRequesting}>
                  依頼中に戻す
                </Button>
            );

            break;
        case 'PROCESS':
            legend = '発注処理';
            buttons.push(
                <Button key="4"
                        bsSize="small"
                        onClick={this.onRevertToRequesting}>
                  依頼中へ戻す
                </Button>
            );
            buttons.push(
                <Button key="5" bsSize="small" onClick={this.onFix}>
                  確定
                </Button>
            );

            break;
        case 'BACK_TO_APPROVED':
            legend = '要訂正?';
            buttons.push(
                <Button key="6"
                        bsSize="small"
                        onClick={this.onRevertToApproved}>
                  承認済みへ戻す
                </Button>
            );

            break;
        default:
            legend = '参照';
        }

        return (
            <div id="order-process">
              <fieldset>
                <legend>{legend}</legend>
                  <div id="order-process-notices">
                    <Notice className="order-process-notice" title="起案番号">
                      {this.props.order.order_code}
                    </Notice>
                    <Notice className="order-process-notice" title="起案日">
                      {this.props.order.drafting_date}
                    </Notice>
                    <Notice className="order-process-notice" title="起案者">
                      {this.props.order.drafter_account}
                    </Notice>
                    <Notice className="order-process-notice" title="発注区分">
                      {Util.toOrderTypeName(this.props.order.order_type)}
                    </Notice>
                    <Notice className="order-process-notice"
                            title="発注元 部門診療科">
                      {this.props.order.department_name}
                   </Notice>
                   <Notice id="order-process-trader" title="発注先 販売元">
                     {this.props.order.trader_name}
                   </Notice>
                 </div>
                 <Input id="order-process-remark"
                        type="text"
                        bsSize="small"
                        placeholder="備考・連絡"
                        value={this.state.order_remark}
                        onChange={this.onChangeRemark} />
              </fieldset>
              <TableFrame key={Math.random()}
                          id="order-process-products"
                          title={table_title}
                          data={table_data} />
              <div id="order-process-totals">
                <Notice className="order-process-total" title="発注総計">
                  {Math.round(order_total).toLocaleString()}
                </Notice>
                <Notice className="order-process-total" title="請求総計">
                  {Math.round(billing_total).toLocaleString()}
                </Notice>
              </div>
              <div id="order-process-buttons">
                {buttons}
              </div>
            </div>
        );
    }
});

module.exports = ProcessOrder;
