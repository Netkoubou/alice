'use strict';
var React      = require('react');
var ReactDOM   = require('react-dom');
var Input      = require('react-bootstrap').Input;
var Button     = require('react-bootstrap').Button;
var XHR        = require('superagent');
var moment     = require('moment');
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

var Buttons = React.createClass({
    propTypes: {
        permission: React.PropTypes.oneOf([
            'REFER_ONLY',
            'BACK_TO_REQUESTING',
            'BACK_TO_APPROVED',
            'PROCESS',
            'APPROVE',
        ]),

        goBack:               React.PropTypes.func.isRequired,
        onApprove:            React.PropTypes.func.isRequired,
        onDeny:               React.PropTypes.func.isRequired,
        onRevertToRequesting: React.PropTypes.func.isRequired,
        onPrint:              React.PropTypes.func.isRequired,
        onFix:                React.PropTypes.func.isRequired,
        onRevertToApproved:   React.PropTypes.func.isRequired,

        need_save: React.PropTypes.bool.isRequired
    },

    render: function() {
        var buttons = [
            <Button key="0" bsSize="small" onClick={this.props.goBack}>
              戻る
            </Button>
        ];

        switch (this.props.permission) {
        case 'APPROVE':
            buttons.push(
                <Button key="1" bsSize="small" onClick={this.props.onApprove}>
                  承認
                </Button>
            );
            buttons.push(
                <Button key="2" bsSize="small" onClick={this.props.onDeny}>
                  否認 
                </Button>
            );
            break;
        case 'BACK_TO_REQUESTING':
            buttons.push(
                <Button key="3"
                        bsSize="small"
                        onClick={this.props.onRevertToRequesting}>
                  依頼中に戻す
                </Button>
            );
            break;
        case 'PROCESS':
            buttons.push(
                <Button key="4"
                        bsSize="small"
                        onClick={this.props.onRevertToRequesting}>
                  依頼中へ戻す
                </Button>
            );
            buttons.push(
                <Button key="5" bsSize="small" onClick={this.props.onPrint}>
                  印刷
                </Button>
            );
            buttons.push(
                <Button key="6"
                        bsSize="small"
                        onClick={this.props.onFix}
                        disabled={!this.props.need_save}>
                  確定
                </Button>
            );
            break;
        case 'BACK_TO_APPROVED':
            buttons.push(
                <Button key="7"
                        bsSize="small"
                        onClick={this.props.onRevertToApproved}>
                  承認済みへ戻す
                </Button>
            );
            break;
        }

        return (
            <div id="process-order-buttons">
              {buttons}
            </div>
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
            products:     products,
            need_save:    false
        };
    },

    onChangeRemark: function(e) {
        this.setState({
            order_remark: e.target.value,
            need_save:    true
        });
    },

    changeOrderState: function(order_state) {
        XHR.post('changeOrderState').send({
            order_code:    this.props.order.order_code,
            order_state:   order_state,
            order_remark:  this.state.order_remark,
            order_version: this.props.order.order_version
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.APPROVE_CHANGE_ORDER_STATE);
                throw 'ajax_changeOrderState';
            }

            if (res.body.status > 1) {
                alert(Messages.server.APPROVE_CHANGE_ORDER_STATE);
                throw 'server_changeOrderState';
            }

            if (res.body.status == 0) {
                alert('完了しました。');
            } else {
                alert(Messages.information.UPDATE_CONFLICT);
            }

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

    onPrint: function() {
        window.info = {
            purpose:       'FAX',
            order_code:    this.props.order.order_code,
            department:    this.props.order.department_name,
            trader:        this.props.order.trader_name,
            drafting_date: this.props.order.drafting_date,
            order_date:    moment().format('YYYY/MM/DD'),
            products:      this.props.order.products.map(function(p) {
                return {
                    name:     p.name,
                    maker:    p.maker,
                    quantity: p.quantity,
                    price:    p.cur_price
                };
            })
        };

        var w = window.open('preview-order.html', '発注書 印刷プレビュー');
    },

    onFix: function() {
        for (var i = 0; i < this.state.products.length; i++) {
            var p = this.state.products[i];

            if (p.state === 'DELIVERED') {
                var e;


                /*
                 * p.cur_price != p.cur_price は NaN 検知するための条件判定
                 * 詳しくは edit-order/FinalPane.js 内のコメント参照。
                 */
                if (p.cur_price <= 0.0 || p.cur_price != p.cur_price) {
                    alert('現在単価には 0 より大きな値を指定して下さい。');
                    var e = this.refs['cur_price' + i.toString()];
                    ReactDOM.findDOMNode(e).focus();
                    return;
                }

                var ba = p.billing_amount;

                if (ba == 0 || ba != ba) {  // ba != ba も同様
                    alert('請求額を指定して下さい。');
                    var e = this.refs['billing_amount' + i.toString()];
                    ReactDOM.findDOMNode(e).focus();
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
                order_version:   this.props.order.order_version,
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

                if (res.body.status > 1) {
                    alert(Messages.server.PROCESS_ORDER_UPDATE_ORDER);
                    throw 'server_updateOrder';
                }

                if (res.body.status == 0) {
                    alert('確定しました。');
                } else {
                    alert(Messages.information.UPDATE_CONFLICT);
                }

                this.props.goBack();
            }.bind(this) );
        }
    },

    onChangeCurPrice: function(index) {
        return function(cur_price) {
            this.state.products[index].cur_price = cur_price;
            this.setState({
                products:  this.state.products,
                need_save: true
            });
        }.bind(this);
    },

    onChangeBillingAmount: function(index) {
        return function(billing_amount) {
            this.state.products[index].billing_amount = billing_amount;
            this.setState({
                products:  this.state.products,
                need_save: true
            });
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
            this.setState({
                products:  this.state.products,
                need_save: true
            });
        }.bind(this);
    },

    render: function() {
        var can_approve       = false;
        var can_process_order = false;

        if (this.props.user.privileged.approve) {
            can_approve = true;
        }

        if (this.props.user.privileged.process_order) {
            can_process_order = true;
        }

        this.props.user.departments.forEach(function(d) {
            if (d.code === this.props.order.order_code) {
                if (d.approve) {
                    can_approve = true;
                }

                if (d.process_order) {
                    can_process_order = true;
                }
            }
        }.bind(this) );

        var permission  = 'REFER_ONLY';
        var order_state = this.props.order.order_state;


        /*
         * 承認可能で、かつ発注処理可能なユーザの場合、
         * 以下のコードでは発注処理可能の方が強いことになる。
         * 但し、そんなユーザは存在しないはず。
         */
        if (can_process_order) {
            switch (order_state) {
            case 'APPROVING':
                permission = 'BACK_TO_REQUESTING';
                break;
            case 'NULLIFIED':
            case 'COMPLETED':
                permission = 'BACK_TO_APPROVED';
                break;
            case 'APPROVED':
                permission = 'PROCESS';
                break;
            }
        } else if (can_approve && order_state === 'APPROVING') {
            permission = 'APPROVE';
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

                // if (this.props.order.products[index].state === 'ORDERED') {
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
                // }
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

        var legend = '参照';

        switch (permission) {
        case 'APPROVE':
            legend = '承認';
            break;
        case 'BACK_TO_REQUESTING':
            legend = '取り下げ?';
            break;
        case 'PROCESS':
            legend = '発注処理';
            break;
        case 'BACK_TO_APPROVED':
            legend = '要訂正?';
            break;
        }

        return (
            <div id="process-order">
              <fieldset>
                <legend>{legend}</legend>
                  <div id="process-order-notices">
                    <Notice className="process-order-notice" title="起案番号">
                      {this.props.order.order_code}
                    </Notice>
                    <Notice className="process-order-notice" title="起案日">
                      {this.props.order.drafting_date}
                    </Notice>
                    <Notice className="process-order-notice" title="起案者">
                      {this.props.order.drafter_account}
                    </Notice>
                    <Notice className="process-order-notice" title="発注区分">
                      {Util.toOrderTypeName(this.props.order.order_type)}
                    </Notice>
                    <Notice className="process-order-notice"
                            title="発注元 部門診療科">
                      {this.props.order.department_name}
                   </Notice>
                   <Notice id="process-order-trader" title="発注先 販売元">
                     {this.props.order.trader_name}
                   </Notice>
                 </div>
                 <Input id="process-order-remark"
                        type="text"
                        bsSize="small"
                        placeholder="備考・連絡"
                        value={this.state.order_remark}
                        onChange={this.onChangeRemark} />
              </fieldset>
              <TableFrame key={Math.random()}
                          id="process-order-products"
                          title={table_title}
                          data={table_data} />
              <div id="process-order-totals">
                <Notice className="process-order-total" title="発注総計">
                  {Math.round(order_total).toLocaleString()}
                </Notice>
                <Notice className="process-order-total" title="請求総計">
                  {Math.round(billing_total).toLocaleString()}
                </Notice>
              </div>
              <Buttons key={Math.random()}
                       permission={permission}
                       goBack={this.props.goBack}
                       onApprove={this.onApprove}
                       onDeny={this.onDeny}
                       onRevertToRequesting={this.onRevertToRequesting}
                       onPrint={this.onPrint}
                       onFix={this.onFix}
                       onRevertToApproved={this.onRevertToApproved}
                       need_save={this.state.need_save} />

            </div>
        );
    }
});

module.exports = ProcessOrder;
