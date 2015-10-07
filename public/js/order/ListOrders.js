/*
 * DB に登録された発注を一覧するためのページ。
 * このページは、他のページへ遷移するための中継ページでしかない。
 * ここで何らかの操作する発注を選択すると、
 * その何らかの操作するためのページへ遷移する。
 */
'use strict';
var React           = require('react');
var Input           = require('react-bootstrap').Input;
var Button          = require('react-bootstrap').Button;
var OverlayTrigger  = require('react-bootstrap').OverlayTrigger;
var Popover         = require('react-bootstrap').Popover;
var XHR             = require('superagent');
var moment          = require('moment');
var EditOrder       = require('./EditOrder');
var ProcessOrder    = require('./ProcessOrder');
var TableFrame      = require('../components/TableFrame');
var CalendarMarker  = require('../components/CalendarMarker');
var Messages        = require('../lib/Messages');
var Util            = require('../lib/Util');


/*
 * 表の発注番号
 */
var OrderCode = React.createClass({
    propTypes: {
        user:     React.PropTypes.object.isRequired,
        order:    React.PropTypes.object.isRequired,
        goBack:   React.PropTypes.func.isRequired,
        onSelect: React.PropTypes.func.isRequired
    },

    render: function() {
        var on_click = function() {
            this.props.onSelect(
                <ProcessOrder user={this.props.user}
                              order={this.props.order}
                              goBack={this.props.goBack} />
            );
        }.bind(this);

        if (this.props.order.order_state === 'REQUESTING') {
            if (!this.props.user.is_approval) {
                /*
                 * 承認権限を持たない人だけが発注を編集できる
                 */
                on_click = function() {
                    this.props.onSelect(
                        <EditOrder account={this.props.user.account}
                                   order={this.props.order}
                                   goBack={this.props.goBack} />
                    );
                }.bind(this);
            }
        }
                
        return (
            <div onClick={on_click}
                 className="order-list-code">
              {this.props.order.order_code}
            </div>
        );
    }
});


/*
 * 以下、本コンポーネントの main
 */
var ListOrders = React.createClass({
    propTypes: { user: React.PropTypes.object.isRequired },

    getInitialState: function() {
        return {
            next_ope:      null,
            start_date:    moment(),
            end_date:      moment(),
            is_requesting: !this.props.user.is_approval,
            is_approving:   this.props.user.is_approval,
            is_approved:   !this.props.user.is_approval,
            is_nullified:  false,
            is_completed:  false,
            orders:     []
        }
    },

    onMark: function(start_date, end_date) {
        this.setState({
            start_date: start_date,
            end_date:   end_date
        });
    },

    onSelect: function(next_ope) {
        this.setState({ next_ope: next_ope });
    },

    backToHere: function() {
        this.setState({ next_ope: null });
        this.onSearch();
    },

    onSearch: function() {
        XHR.post('searchOrders').send({
            start_date: this.state.start_date.format('YYYY/MM/DD'),
            end_date:   this.state.end_date.format('YYYY/MM/DD'),
            state: {
                is_requesting: this.state.is_requesting,
                is_approving:  this.state.is_approving,
                is_approved:   this.state.is_approved,
                is_nullified:  this.state.is_nullified,
                is_completed:  this.state.is_completed
            }
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.ORDER_LIST_SEARCH_ORDERS);
                throw 'ajax_searchOrders';
            }

            if (res.body.status != 0) {
                alert(Messages.server.ORDER_LIST_SEARCH_ORDERS);
                throw 'server_searchOrders';
            }

            var orders = res.body.orders.map(function(order) {
                var order_state = Util.toOrderStateName(order.order_state);
                var order_type = Util.toOrderTypeName(order.order_type);

                if (order.order_type === 'URGENCY_ORDER') {
                    if (order.order_state != 'COMPLETED') {
                        if (order.order_state != 'NULLIFIED') {
                            order_type = <span className="order-list-urgency">
                                           {order_type}
                                         </span>
                        }
                    }
                }

                var order_total   = 0.0;
                var billing_total = 0;

                order.products.forEach(function(f) {
                    order_total   += f.cur_price * f.quantity;
                    billing_total += f.billing_amount;
                });

                order_total = Math.round(order_total);

                var order_remark = '';

                if (order.order_remark != '') {
                    var popover = <Popover title="備考・連絡">
                                    {order.order_remark}
                                  </Popover>;

                    order_remark = (
                        <OverlayTrigger container={this.refs.orderList}
                                        placement="left"
                                        overlay={popover}>
                          <span className="order-list-remark">!</span>
                        </OverlayTrigger>
                    );
                }

                return [
                    {   // 起案番号
                        value: order.order_code,
                        view:  <OrderCode user={this.props.user}
                                          order={order}
                                          goBack={this.backToHere}
                                          onSelect={this.onSelect} />
                    },
                    {   // 起案日
                        value: order.drafting_date,
                        view:  order.drafting_date
                    },
                    {   // 起案者
                        value: order.drafter_account,
                        view:  order.drafter_account
                    },
                    {   // 発注区分
                        value: order_type,
                        view:  order_type
                    },
                    {   // 発注元 部門診療科
                        value: order.department_name,
                        view:  order.department_name
                    },
                    {   // 発注先 販売元
                        value: order.trader_name,
                        view:  order.trader_name
                    },
                    {   // 発注総計
                        value: order_total,
                        view:  order_total.toLocaleString()
                    },
                    {   // 請求総計
                        value: billing_total,
                        view:  billing_total.toLocaleString()
                    },
                    {   // 状態
                        value: order_state,
                        view:  order_state
                    },
                    {   // 備考・連絡
                        value: '',
                        view:  order_remark,
                    }
                ];
            }.bind(this) );

            this.setState({ orders: orders });
        }.bind(this) )
    },

    onChangeCheckbox: function() {
        this.setState({
            is_requesting: this.refs.requesting.getChecked(),
            is_approving:  this.refs.approving.getChecked(),
            is_approved:   this.refs.approved.getChecked(),
            is_nullified:  this.refs.nullified.getChecked(),
            is_completed:  this.refs.completed.getChecked()
        });
    },

    render: function() {
        if (this.state.next_ope != null) {
            return this.state.next_ope;
        }
        
        // LIST_ORDERS
        var title = [
            { name: '起案番号',          type: 'string' },
            { name: '起案日',            type: 'string' },
            { name: '起案者',            type: 'string' },
            { name: '発注区分',          type: 'string' },
            { name: '発注元 部門診療科', type: 'string' },
            { name: '発注先 販売元',     type: 'string' },
            { name: '発注総計',          type: 'number' },
            { name: '請求総計',          type: 'number' },
            { name: '状態',              type: 'string' },
            { name: '!',                 type: 'string' }
        ];

        return (
            <div id="order-list" ref="orderList">
              <fieldset id="order-list-search">
                <legend>検索</legend>
                <div id="order-list-calendar-marker">
                  <CalendarMarker startDate={this.state.start_date}
                                  endDate={this.state.end_date}
                                  onMark={this.onMark} />
                </div>
                <div className="order-list-checkbox">
                  <Input type="checkbox"
                         label="依頼中"
                         checked={this.state.is_requesting}
                         onChange={this.onChangeCheckbox}
                         ref="requesting" />
                </div>
                <div className="order-list-checkbox">
                  <Input type="checkbox"
                         label="承認待ち"
                         checked={this.state.is_approving}
                         onChange={this.onChangeCheckbox}
                         ref="approving" />
                </div>
                <div className="order-list-checkbox">
                  <Input type="checkbox"
                         label="承認済み"
                         checked={this.state.is_approved}
                         onChange={this.onChangeCheckbox}
                         ref="approved" />
                </div>
                <div className="order-list-checkbox">
                  <Input type="checkbox"
                         label="無効"
                         checked={this.state.is_nullified}
                         onChange={this.onChangeCheckbox}
                         ref="nullified" />
                </div>
                <div className="order-list-checkbox">
                  <Input type="checkbox"
                         label="完了"
                         checked={this.state.is_completed}
                         onChange={this.onChangeCheckbox}
                         ref="completed" />
                </div>
                <div id="order-list-buttons">
                  <Button bsSize="small" onClick={this.onSearch}>検索</Button>
                </div>
              </fieldset>
              <fieldset id="order-list-table-field">
                <legend>発注一覧</legend>
                <TableFrame id="order-list-table"
                            title={title}
                            data={this.state.orders} />
              </fieldset>
            </div>
        );
    }
});

module.exports = ListOrders;
