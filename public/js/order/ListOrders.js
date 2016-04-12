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
        isExpensive: React.PropTypes.bool.isRequired,
        user:        React.PropTypes.object.isRequired,
        order:       React.PropTypes.object.isRequired,
        goBack:      React.PropTypes.func.isRequired,
        onSelect:    React.PropTypes.func.isRequired
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
                
        var class_name = 'list-orders-order-code';

        if (this.props.isExpensive) {
            /*
             * 院長承認が必要な発注は、発注番号を赤にすることで区別する。
             */
            class_name = 'list-orders-order-code-for-expensive';
        }

        return (
            <div className={class_name} onClick={on_click}>
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
            next_ope: null, // これが、本ページから遷移する先のページ
                            // を示す変数。null の場合は遷移せず、
                            // 本ページに留まる。
            start_date:           moment(),
            end_date:             moment(),
            is_requesting:        can_process_order,
            is_approving:         can_approve,
            is_approved:          can_process_order,
            is_partially_ordered: false,
            is_fully_ordered:     false,
            is_nullified:         false,
            is_completed:         false,
            orders:               []
        };
    },

    onMark: function(start_date, end_date) {
        this.setState({
            start_date: start_date,
            end_date:   end_date
        });
    },


    /*
     * 遷移先のページを設定するためのコールバック関数。
     * ま、説明するまでもなく、見りゃ分かりますね。
     */
    onSelect: function(next_ope) { this.setState({ next_ope: next_ope }); },


    /*
     * 名前の通り、遷移した先のページから本ページに戻って来るためのコール
     * バック関数。
     */
    backToHere: function() {
        this.setState({ next_ope: null });
        this.onSearch();
    },

    onSearch: function() {
        /*
         * 一部発注と全発注済みは、必要に迫られて後から付け足した状態。
         * DB を変更することはできないので、承認済みの発注の中から、
         * 
         *   - 物品が一つも発注されていない       == 承認済み
         *   - 未発注の物品と発注済みの物品が混在 == 一部発注
         *   - 物品は全て発注されている           == 全発注済み
         *         
         * という感じにクライアント側で選別する。
         * 面倒臭い ...
         */
        var is_approved          = this.state.is_approved;
        var is_partially_ordered = this.state.is_partially_ordered;
        var is_fully_ordered     = this.state.is_fully_ordered;

        var approved = is_approved || is_partially_ordered || is_fully_ordered;

        XHR.post('searchOrders').send({
            start_date: this.state.start_date.format('YYYY/MM/DD'),
            end_date:   this.state.end_date.format('YYYY/MM/DD'),
            state: {
                is_requesting: this.state.is_requesting,
                is_approving:  this.state.is_approving,
                is_approved:   approved,
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

            var orders = res.body.orders.filter(function(order) {
                if (order.order_state != 'APPROVED') {
                    return true;
                }

                var has_unordered = false;
                var has_ordered   = false;

                order.products.forEach(function(p) {
                    if (p.state === 'UNORDERED') {
                        has_unordered = true;
                    } else {
                        has_ordered = true;
                    }
                });

                if (is_approved && has_unordered && !has_ordered) {
                    return true;
                }
                
                if (is_partially_ordered && has_unordered && has_ordered) {
                    return true;
                }

                if (is_fully_ordered && !has_unordered && has_ordered) {
                    return true;
                }

                return false;
            });

            this.setState({ orders: orders });
        }.bind(this) )
    },

    onClear: function() {
        this.setState({
            is_requesting:        false,
            is_approving:         false,
            is_approved:          false,
            is_partially_ordered: false,
            is_fully_ordered:     false,
            is_nullified:         false,
            is_completed:         false
        });
    },

    onChangeCheckbox: function() {
        this.setState({
            is_requesting:        this.refs.requesting.getChecked(),
            is_approving:         this.refs.approving.getChecked(),
            is_approved:          this.refs.approved.getChecked(),
            is_partially_ordered: this.refs.partially_ordered.getChecked(),
            is_fully_ordered:     this.refs.fully_ordered.getChecked(),
            is_nullified:         this.refs.nullified.getChecked(),
            is_completed:         this.refs.completed.getChecked()
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
                  <div className="list-orders-remark">!</div>
                </OverlayTrigger>
            );
        }

        return '';
    },

    composeTableFrameData: function() {
        return this.state.orders.map(function(order, index) {
            var order_type_view  = this.decideOrderTypeView(order);
            var order_remark     = this.decideOrderRemark(order, index)
            var order_state;
            

            /*
             * 差し戻された発注を目立たせるために、状態名を赤に
             */
            if (order.order_state === 'REQUESTING' && order_remark != '') {
                order_state = (
                    <span className="list-orders-turned-back">
                      {Util.toOrderStateName(order.order_state)}
                    </span>
                );
            } else if (order.order_state === 'APPROVED') {
                var has_unordered = false;
                var has_ordered   = false;

                order.products.forEach(function(p) {
                    if (p.state === 'UNORDERED') {
                        has_unordered = true;
                    } else {
                        has_ordered = true;
                    }
                });

                if (has_unordered && has_ordered) {
                    order_state = '一部発注';
                } else if (!has_unordered && has_ordered) {
                    order_state = '全発注済';
                } else {
                    order_state = Util.toOrderStateName(order.order_state);
                }
            } else {
                order_state = Util.toOrderStateName(order.order_state);
            }

            var order_total   = 0.0;
            var billing_total = 0;
            var is_expensive  = false;

            order.products.forEach(function(f) {
                var sub_total  = f.cur_price * f.quantity;


                /*
                 * 発注の小計 (単価 * 数量) が 150,000 円以上の場合、
                 * 高額な物を買うということで、院長承認が必要。
                 * 発注の「総」計ではなく、「小」計であることに注意。
                 * 発注「総」計を見ても、院長承認が必要かどうかは分からない。
                 */
                if (sub_total >= 150000) {
                    is_expensive = true;
                }

                order_total   += sub_total;
                billing_total += f.billing_amount;
            });

            order_total = Math.round(order_total);

            return [
                {   // 起案番号
                    value: order.order_code,
                    view:  <OrderCode isExpensive={is_expensive}
                                      user={this.props.user}
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
                    view:  order_remark
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
                       label="承認済"
                       checked={this.state.is_approved}
                       onChange={this.onChangeCheckbox}
                       ref="approved" />
              </div>
              <div className="list-orders-checkbox">
                <Input type="checkbox"
                       label="一部発注"
                       checked={this.state.is_partially_ordered}
                       onChange={this.onChangeCheckbox}
                       ref="partially_ordered" />
              </div>
              <div className="list-orders-checkbox">
                <Input type="checkbox"
                       label="全発注済"
                       checked={this.state.is_fully_ordered}
                       onChange={this.onChangeCheckbox}
                       ref="fully_ordered" />
              </div>
              <div className="list-orders-checkbox-short">
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
                <Button bsStyle="primary"
                        bsSize="large"
                        className="list-orders-button"
                        onClick={this.onClear}>
                  クリア
                </Button>
                <Button bsStyle="primary"
                        bsSize="large"
                        className="list-orders-button"
                        onClick={this.onSearch}>
                  検索
                </Button>
              </div>
            </fieldset>
        );
    },

    toApproving: function(order) {
        XHR.post('changeOrderState').send({
            order_id:      order.order_id,    // 不要
            order_code:    order.order_code,
            order_state:   'APPROVING',
            order_remark:  order.order_remark,
            order_version: order.order_version
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.LIST_ORDERS_CHANGE_ORDER_STATE);
            } else if (res.body.status > 1) {
                alert(Messages.server.LIST_ORDERS_CHANGE_ORDER_STATE);
            } else if (res.body.status == 1) {
                alert(Messages.information.UPDATE_CONFLICT);
            }
        });
    },

    toOrdered: function(order) {
        XHR.post('updateOrder').send({
            order_id:      order.order_id,
            order_code:    order.order_code,
            order_state:   'APPROVED',
            order_remark:  order.order_remark,
            order_version: order.order_version,
            trader_code:   order.trader_code,
            products:      order.products.map(function(p) {
                return {
                    code:           p.code,
                    price:          p.cur_price,
                    quantity:       p.quantity,
                    state:          'ORDERED',
                    billing_amount: p.billing_amount
                };
            }),
            completed_date: ''
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.LIST_ORDERS_UPDATE_ORDER);
            } else if (res.body.status > 1) {
                alert(Messages.server.LIST_ORDERS_UPDATE_ORDER);
            } else if (res.body.status == 1) {
                alert(Messages.information.UPDATE_CONFLICT);
            }
        });
    },

    toSheetInfo: function(order, purpose, order_date) {
        var department_name = order.department_name;
        var department_tel  = order.department_tel;

        return {
            purpose:       purpose,
            order_code:    order.order_code,
            department:    department_name + ' (' + department_tel + ') ',
            trader:        order.trader_name,
            drafting_date: order.drafting_date,
            order_date:    order_date,
            products:      order.products.map(function(p) {
                return {
                    name:     p.name,
                    maker:    p.maker,
                    quantity: p.quantity,
                    price:    p.cur_price
                };
            })
        }
    },

    printAll: function() {
        var orders = [];

        this.state.orders.forEach(function(order) {
            switch (order.order_state) {
            case 'REQUESTING':
                this.toApproving(order);
                orders.push(this.toSheetInfo(order, 'APPROVAL', '') );
                break;
            case 'APPROVED':
                if (order.trader_communication === 'fax') {
                    var ordered_ones = order.products.filter(function(p) {
                        return p.state != 'UNORDERED';
                    });

                    if (ordered_ones == 0) {
                        var today = moment().format('YYYY/MM/DD');

                        this.toOrdered(order);
                        orders.push(this.toSheetInfo(order, 'FAX', today) );
                    }
                }

                break;
            }
        }.bind(this) );

        window.orders = orders;
        window.open('preview-all-orders.html', '発注書 全印刷プレビュー');
        this.onSearch();
    },

    render: function() {
        /*
         * ここで、本ページに留まるか、他のページに遷移するかを制御する。
         * this.state.next_ope を (非 null から) null に変更することで、
         * あたかも本ページに戻って来るかのように振る舞うことができる。
         */
        if (this.state.next_ope != null) {
            return this.state.next_ope;
        }
        
        var title     = this.makeTableFrameTitle();
        var data      = this.composeTableFrameData();
        var print_all = null;

        if (this.props.user.privileged.process_order) {
            print_all = (
                <Button bsStyle="primary"
                        bsSize="large"
                        id="list-orders-print-all"
                        onClick={this.printAll}>
                  全印刷
                </Button>
            );
        }

        return (
            <div id="list-orders" ref="listOrders">
              {this.generateSearchPain()}
              <fieldset id="list-orders-table-frame">
                <legend>発注一覧</legend>
                <TableFrame id="list-orders-orders"
                            title={title}
                            data={data} />
              </fieldset>
              {print_all}
            </div>
        );
    }
});

module.exports = ListOrders;
