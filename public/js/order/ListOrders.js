/*
 * DB に登録された発注を一覧するためのページ。
 * このページは、他のページへ遷移するための中継ページでしかない。
 * ここで何らかの操作する発注を選択すると、
 * その何らかの操作するためのページへ遷移する。
 */
'use strict';
var React          = require('react');
var Input          = require('react-bootstrap').Input;
var Button         = require('react-bootstrap').Button;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Popover        = require('react-bootstrap').Popover;
var XHR            = require('superagent');
var moment         = require('moment');
var EditOrder      = require('./EditOrder');
var ProcessOrder   = require('./ProcessOrder');
var TableFrame     = require('../components/TableFrame');
var CalendarMarker = require('../components/CalendarMarker');
var Messages       = require('../lib/Messages');
var Util           = require('../lib/Util');


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
            var can_edit_order = false;

            if (this.props.user.privileged.process_order) {
                can_edit_order = true;
            } else {
                this.props.user.departments.forEach(function(d) {
                    if (d.code === this.props.order.department_code) {
                        if (d.process_order) {
                            can_edit_order = true;
                        }
                    }
                }.bind(this) );
            }

            if (can_edit_order) {
                on_click = function() {
                    this.props.onSelect(
                        <EditOrder user={this.props.user}
                                   order={this.props.order}
                                   goBack={this.props.goBack} />
                    );
                }.bind(this);
            }
        }
                
        return (
            <div className="list-orders-order-code" onClick={on_click}>
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
        var can_approve       = false;
        var can_process_order = false;

        if (this.props.user.privileged.approve) {
            can_approve = true;
        }
        
        if (this.props.user.privileged.process_order) {
            can_process_order = true;
        }

        this.props.user.departments.forEach(function(d) {
            if (d.approve) {
                can_approve = true;
            }

            if (d.process_order) {
                can_process_order = true;
            }
        });

        return {
            next_ope:      null,
            start_date:    moment(),
            end_date:      moment(),
            is_requesting: can_process_order,
            is_approving:  can_approve,
            is_approved:   can_process_order,
            is_nullified:  false,
            is_completed:  false,
            orders:        []
        };
    },

    onMark: function(start_date, end_date) {
        this.setState({
            start_date: start_date,
            end_date:   end_date
        });
    },

    onSelect: function(next_ope) { this.setState({ next_ope: next_ope }); },

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
                alert(Messages.ajax.LIST_ORDERS_SEARCH_ORDERS);
                throw 'ajax_searchOrders';
            }

            if (res.body.status != 0) {
                alert(Messages.server.LIST_ORDERS_SEARCH_ORDERS);
                throw 'server_searchOrders';
            }

            this.setState({ orders: res.body.orders });
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

    makeTableFrameTitle: function() {
        return [
            { name: '起案番号',          type: 'string' },
            { name: '起案日',            type: 'string' },
            { name: '起案者',            type: 'string' },
            { name: '発注区分',          type: 'string' },
            { name: '発注元 部門診療科', type: 'string' },
            { name: '発注先 販売元',     type: 'string' },
            { name: '発注総計',          type: 'number' },
            { name: '請求総計',          type: 'number' },
            { name: '状態',              type: 'string' },
            { name: '!',                 type: 'void' }
        ];
    },

    decideOrderTypeView: function(order) {
        var view  = Util.toOrderTypeName(order.order_type);

        if (order.order_type === 'URGENCY_ORDER') {
            if (order.order_state != 'COMPLETED') {
                if (order.order_state != 'NULLIFIED') {
                    return (
                        <span className="list-orders-urgency">
                          {view}
                        </span>
                    );
                }
            }
        }

        return view;
    },

    decideOrderRemark: function(order, index) {
        if (order.order_remark != '') {
            var id      = 'list-orders-popover' + index.toString();
            var popover = <Popover id={id} title="備考・連絡">
                            {order.order_remark}
                          </Popover>;

            return (
                <OverlayTrigger container={this.refs.listOrders}
                                placement="left"
                                overlay={popover}>
                  <span className="list-orders-remark">!</span>
                </OverlayTrigger>
            );
        }

        return '';
    },

    composeTableFrameData: function() {
        return this.state.orders.map(function(order, index) {
            var order_state      = Util.toOrderStateName(order.order_state);
            var order_type_view  = this.decideOrderTypeView(order);

            var order_total   = 0.0;
            var billing_total = 0;

            order.products.forEach(function(f) {
                order_total   += f.cur_price * f.quantity;
                billing_total += f.billing_amount;
            });

            order_total = Math.round(order_total);

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
                    value: order.order_type,
                    view:  order_type_view
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
                    view:  this.decideOrderRemark(order, index)
                }
            ];
        }.bind(this) );
    },


    /*
     * ref があるため、component とはしない (というかできない)
     */
    generateSearchPain: function() {
        return (
            <fieldset id="list-orders-search">
              <legend>検索</legend>
              <div id="list-orders-calendar-marker">
                <CalendarMarker startDate={this.state.start_date}
                                endDate={this.state.end_date}
                                onMark={this.onMark} />
              </div>
              <div className="list-orders-checkbox">
                <Input type="checkbox"
                       label="依頼中"
                       checked={this.state.is_requesting}
                       onChange={this.onChangeCheckbox}
                       ref="requesting" />
              </div>
              <div className="list-orders-checkbox">
                <Input type="checkbox"
                       label="承認待ち"
                       checked={this.state.is_approving}
                       onChange={this.onChangeCheckbox}
                       ref="approving" />
              </div>
              <div className="list-orders-checkbox">
                <Input type="checkbox"
                       label="承認済み"
                       checked={this.state.is_approved}
                       onChange={this.onChangeCheckbox}
                       ref="approved" />
              </div>
              <div className="list-orders-checkbox">
                <Input type="checkbox"
                       label="無効"
                       checked={this.state.is_nullified}
                       onChange={this.onChangeCheckbox}
                       ref="nullified" />
              </div>
              <div className="list-orders-checkbox">
                <Input type="checkbox"
                       label="完了"
                       checked={this.state.is_completed}
                       onChange={this.onChangeCheckbox}
                       ref="completed" />
              </div>
              <div id="list-orders-buttons">
                <Button bsSize="small" onClick={this.onSearch}>検索</Button>
              </div>
            </fieldset>
        );
    },

    render: function() {
        if (this.state.next_ope != null) {
            return this.state.next_ope;
        }
        
        var title = this.makeTableFrameTitle();
        var data  = this.composeTableFrameData();

        return (
            <div id="list-orders" ref="listOrders">
              {this.generateSearchPain()}
              <fieldset id="list-orders-table-frame">
                <legend>発注一覧</legend>
                <TableFrame id="list-orders-orders"
                            title={title}
                            data={data} />
              </fieldset>
            </div>
        );
    }
});

module.exports = ListOrders;
