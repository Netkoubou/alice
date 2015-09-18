'use strict';
var React          = require('react');
var Input          = require('react-bootstrap').Input;
var Button         = require('react-bootstrap').Button;
var XHR            = require('superagent');
var moment         = require('moment');
var TableFrame     = require('../components/TableFrame');
var CalendarMarker = require('../components/CalendarMarker');
var Messages       = require('../lib/Messages');
var Util           = require('../lib/Util');

var OrderList = React.createClass({
    propTypes: { user: React.PropTypes.object.isRequired },

    getInitialState: function() {
        return {
            start_date: moment(),
            end_date:   moment(),
            orders:     []

        }
    },

    onMark: function(start_date, end_date) {
        this.setState({
            start_date: start_date,
            end_date:   end_date
        });
    },

    onSearch: function() {
        XHR.post('searchOrders').send({
            start_date: this.state.start_date.format('YYYY/MM/DD'),
            end_date:   this.state.end_date.format('YYYY/MM/DD'),
            state: {
                is_requesting: this.refs.requesting.getChecked(),
                is_approving:  this.refs.approving.getChecked(),
                is_denied:     this.refs.denied.getChecked(),
                is_approved:   this.refs.approved.getChecked(),
                is_nullified:  this.refs.nullified.getChecked(),
                is_completed:  this.refs.completed.getChecked()
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
                var order_type  = Util.toOrderTypeName(order.order_type);
                var order_total = 0.0;
                var final_total = 0.0;

                order.products.forEach(function(f) {
                    order_total += f.order_price * f.quantity;
                    final_total += f.final_price * f.quantity;
                });

                order_total = Math.round(order_total);
                final_total = Math.round(final_total);

                return [
                    {   // 起案番号
                        value: order.order_code,
                        view:  order.order_code
                    },
                    {   // 起案日
                        value: order.drafting_date,
                        view:  order.drafting_date
                    },
                    {   // 起案者
                        value: order.originator_name,
                        view:  order.originator_name
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
                    {   // 確定総計
                        value: final_total,
                        view:  final_total.toLocaleString()
                    },
                    {   // 状態
                        value: order_state,
                        view:  order_state
                    }
                ];
            }.bind(this) );

            this.setState({ orders: orders });
        }.bind(this) )
    },

    render: function() {
        var title = [
            { name: '起案番号',          type: 'string' },
            { name: '起案日',            type: 'string' },
            { name: '起案者',            type: 'string' },
            { name: '発注区分',          type: 'string' },
            { name: '発注元 部門診療科', type: 'string' },
            { name: '発注先 販売元',     type: 'string' },
            { name: '発注総計',          type: 'number' },
            { name: '確定総計',          type: 'number' },
            { name: '状態',              type: 'string' }
        ];

        return (
            <div id="order-list">
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
                         defaultChecked={!this.props.user.is_approval}
                         ref="requesting" />
                </div>
                <div className="order-list-checkbox">
                  <Input type="checkbox"
                         label="承認待ち"
                         defaultChecked={this.props.user.is_approval}
                         ref="approving" />
                </div>
                <div className="order-list-checkbox">
                  <Input type="checkbox" label="否認" ref="denied" />
                </div>
                <div className="order-list-checkbox">
                  <Input type="checkbox"
                         label="承認済み"
                         defaultChecked={!this.props.user.is_approval}
                         ref="approved" />
                </div>
                <div className="order-list-checkbox">
                  <Input type="checkbox" label="無効" ref="nullified" />
                </div>
                <div className="order-list-checkbox">
                  <Input type="checkbox" label="完了" ref="completed" />
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

module.exports = OrderList;
