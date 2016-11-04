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
var Select         = require('../components/Select');
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

var FilterTextInputs = React.createClass({
    propTypes: {
        id:                 React.PropTypes.string.isRequired,
        valueOfDepartment:  React.PropTypes.string.isRequired,
        onChangeDepartment: React.PropTypes.func.isRequired,
        valueOfTrader:      React.PropTypes.string.isRequired,
        onChangeTrader:     React.PropTypes.func.isRequired,
        departments:        React.PropTypes.array.isRequired,
        traders:            React.PropTypes.array.isRequired
    },

    render: function() {
        var departments = this.props.departments.map(function(d, i) {
            return <option value={d} key={i + 1}>{d}</option>;
        });

        var traders = this.props.traders.map(function(t, i) {
            return <option value={t} key={i + 1}>{t}</option>;
        });

        /*
        var department = (
            <div className="list-orders-filter">
              <input className="list-orders-filter-input"
                     type="text"
                     autoComplete="on"
                     onChange={this.props.onChangeDepartment}
                     value={this.props.valueOfDepartment}
                     list="departments" />
              <datalist id="departments">
                {departments}
              </datalist>
            </div>
        );
        */

        departments.unshift(
            <option value="" key={0}>
              --指定しない--&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </option>
        );

        var department = (
            <div className="list-orders-filter">
              <select className="list-orders-filter-select"
                      value={this.props.valueOfDepartment}
                      onChange={this.props.onChangeDepartment}>
                {departments}
              </select>
            </div>
        );

        /*
        var trader = (
            <div className="list-orders-filter">
              <input className="list-orders-filter-input"
                     type="text"
                     autoComplete="on"
                     onChange={this.props.onChangeTrader}
                     value={this.props.valueOfTrader}
                     list="traders" />
              <datalist id="traders">
                {traders}
              </datalist>
            </div>
        );
        */

        traders.unshift(
            <option value="" key={0}>
              --指定しない--&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </option>
        ) ;

        var trader = (
            <div className="list-orders-filter">
              <select className="list-orders-filter-select"
                      value={this.props.valueOfTrader}
                      onChange={this.props.onChangeTrader}>
                {traders}
              </select>
            </div>
        );

        return (
            <div id={this.props.id}>
              <table>
                <colgroup>
                  <col /><col /><col /><col /><col /><col />
                  <col /><col /><col /><col /><col />
                </colgroup>
                <tbody>
                  <tr>
                    <td></td>
                    <td></td>
                    <td>
                      {department}
                    </td>
                    <td></td>
                    <td></td>
                    <td>
                      {trader}
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
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
                            // 本ページに留まる
            selected: 0,    // goBack で戻って来た時に、選択された発注が一覧の
                            // 一番上に来るようスクロールするため、選択された
                            // 発注の index を覚えておくための変数
            start_date:    moment(),
            end_date:      moment(),
            is_requesting: can_process_order,
            is_approving:  can_approve,
            is_approved:   can_process_order,
            is_ordered:    false,
            is_delivered:  false,
            is_nullified:  false,
            is_vacant:     false,
            is_completed:  false,
            order_code:    '',
            trader_code:   '',

            orders:        [],
            traders:       [],

            department_filter_text: '',
            trader_filter_text:     ''
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
    onSelect: function(index) {
        return function(next_ope) {
            this.setState({
                next_ope: next_ope,
                selected: index
            });
        }.bind(this);
    },


    /*
     * 名前の通り、遷移した先のページから本ページに戻って来るためのコール
     * バック関数。
     */
    backToHere: function() {
        this.setState({ next_ope: null });
        this.onSearch();
    },

    filterProducts: function(order) {
        if (order.order_state != 'APPROVED') {
            return true;
        }


        /*
         * 発注の中の物品は、「未発注」とそれ以外が混在することは
         * ない (と言うか、しちゃいけない)。
         * このため、発注が「承認済」なのか「発注済」なのかは、
         * 1 番目の物品の状態で判断できる。
         * 
         */
        var products = order.products;

        if (this.state.is_approved && products[0].state === 'UNORDERED') {
            return true;
        }

        var is_selected;

        if (this.state.is_ordered) {
            is_selected = false;

            products.forEach(function(p) {
                if (p.state === 'ORDERED') {
                    is_selected = true;
                }
            });

            if (is_selected) {
                return true;
            }
        }

        if (this.state.is_delivered) {
            is_selected = false;

            products.forEach(function(p) {
                if (p.state.match(/^\d{4}\/\d{2}\/\d{2} /) ) {
                    is_selected = true;
                }
            });

            if (is_selected) {
                return true;
            }
        }


        /*
         * 何もチェックが無い時は全部表示
         */
        var r  = this.state.is_requesting;
        var ag = this.state.is_approving;
        var ad = this.state.is_approved;
        var o  = this.state.is_ordered;
        var d  = this.state.is_delivered;
        var n  = this.state.is_nullified;
        var c  = this.state.is_completed;

        if (!(r || ag || ad || o || d || n || c) ) {
            return true;
        }

        return false;
    },

    onSearch: function() {
        var a = this.state.is_approved;
        var o = this.state.is_ordered;
        var d = this.state.is_delivered;


        /*
         * 発注済及び納品済は、必要に迫られて後から付け足した状態。
         * DB を変更することはできないので、承認済みの発注の中から、
         * 
         *   - 物品が未だ (一つも) 発注されていない == 承認済
         *   - 発注済 (状態) の物品がある: 発注済に引っかかる
         *   - 納品済 (状態) の物品がある: 納品済に引っかかる
         *         
         * という感じにクライアント側で選別する。
         * 面倒臭い ...
         */
        XHR.post('searchOrders').send({
            start_date: this.state.start_date.format('YYYY/MM/DD'),
            end_date:   this.state.end_date.format('YYYY/MM/DD'),
            state: {
                is_requesting: this.state.is_requesting,
                is_approving:  this.state.is_approving,
                is_approved:   a || o || d,
                is_nullified:  this.state.is_nullified,
                is_vacant:     this.state.is_vacant,
                is_completed:  this.state.is_completed
            },
            order_code:  this.state.order_code,
            trader_code: this.state.trader_code
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.LIST_ORDERS_SEARCH_ORDERS);
                throw 'ajax_searchOrders';
            }

            var orders;

            if (res.body.status == 2) {
                var reason = res.body.reason;
                alert('起案番号の正規表現に誤りがあります: ' + reason);
                orders = [];
            } else if (res.body.status != 0) {
                alert(Messages.server.LIST_ORDERS_SEARCH_ORDERS);
                throw 'server_searchOrders';
            } else {
                orders = res.body.orders;
            }                

            orders.filter(this.filterProducts).sort(function(a, b) {
                return a.order_code < b.order_code ? -1: 1;
            });

            this.setState({ orders: orders });
        }.bind(this) )
    },

    onClear: function() {
        this.setState({
            is_requesting: false,
            is_approving:  false,
            is_approved:   false,
            is_ordered:    false,
            is_delivered:  false,
            is_nullified:  false,
            is_vacant:     false,
            is_completed:  false,
            order_code:    '',
            trader_code:   ''
        });
    },

    onChangeCheckbox: function() {
        this.setState({
            is_requesting: this.refs.requesting.getChecked(),
            is_approving:  this.refs.approving.getChecked(),
            is_approved:   this.refs.approved.getChecked(),
            is_ordered:    this.refs.ordered.getChecked(),
            is_delivered:  this.refs.delivered.getChecked(),
            is_nullified:  this.refs.nullified.getChecked(),
            is_vacant:     this.refs.vacant.getChecked(),
            is_completed:  this.refs.completed.getChecked()
        });
    },

    onChangeOrderCode: function(e) {
        this.setState({order_code: e.target.value});
    },

    onSelectTrader: function(trader) {
        this.setState({trader_code: trader.code}); 
    },

    makeTableFrameTitle: function() {
        return [
            { name: '起案日',            type: 'string' },
            { name: '起案番号',          type: 'string' },
            { name: '発注元 部門診療科', type: 'string' },
            { name: '発注区分',          type: 'string' },
            { name: '品名',              type: 'string' },
            { name: '発注先 販売元',     type: 'string' },
            { name: '発注総計',          type: 'number' },
            { name: '請求総計',          type: 'number' },
            { name: '状態',              type: 'string' },
            { name: '起案者',            type: 'string' },
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
        var orders = this.state.orders;

        if (this.state.department_filter_text != '') {
            orders = orders.filter(function(o) {
                return o.department_name === this.state.department_filter_text;
            }.bind(this) );
        }

        if (this.state.trader_filter_text != '') {
            orders = orders.filter(function(o) {
                return o.trader_name === this.state.trader_filter_text;
            }.bind(this) );
        }

        return orders.map(function(order, index) {
            var order_type_view  = this.decideOrderTypeView(order);
            var order_remark     = this.decideOrderRemark(order, index)
            var order_state;
            
            if (order.order_state === 'REQUESTING' && order_remark != '') {
                /*
                 * 差し戻された発注 (備考に何かしら記入される) を目立たせる
                 * よう状態名を赤にする。
                 */
                order_state = (
                    <span className="list-orders-turned-back">
                      {Util.toOrderStateName(order.order_state)}
                    </span>
                );
            } else if (order.order_state === 'APPROVED') {
                if (order.products[0].state === 'UNORDERED') {
                    order_state = Util.toOrderStateName(order.order_state);
                } else {
                    /*
                     * 発注済と納品済の物品が混在した発注は、注意を引くために
                     * 状態名を赤にする。
                     */
                    var num_of_ordered   = 0;
                    var num_of_delivered = 0;

                    order.products.forEach(function(p) {
                        if (p.state === 'ORDERED') {
                            num_of_ordered++;
                        } else if (p.state.match(/^\d{4}\/\d{2}\/\d{2} /) ) {
                            num_of_delivered++;
                        }
                    });

                    if (num_of_ordered > 0 && num_of_delivered > 0) {
                        order_state = (
                            <span className="list-orders-mixed-product-state">
                              発注済
                            </span>
                        );
                    } else {
                        order_state = '発注済';
                    }
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

            var order_code;
            var product_name;

            if (order.is_alive) {
                order_code = (
                    <OrderCode isExpensive={is_expensive}
                               user={this.props.user}
                               order={order}
                               goBack={this.backToHere}
                               onSelect={this.onSelect(index)} />
                );

                product_name = order.products[0].name;
            } else {
                order_code   = order.order_code;
                product_name = '';
                order_state  = '欠番';
            }

            return [
                {   // 起案日
                    value: order.drafting_date,
                    view:  order.drafting_date.replace(/^\d{4}\//, '')
                },
                {   // 起案番号
                    value: order.order_code,
                    view:  order_code
                },
                {   // 発注元 部門診療科
                    value: order.department_name,
                    view:  order.department_name
                },
                {   // 発注区分
                    value: order.order_type,
                    view:  order_type_view
                },
                {
                    // 品名
                    value: product_name,
                    view:  product_name
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
                {   // 起案者
                    value: order.drafter_account,
                    view:  order.drafter_account
                },
                {   // 備考・連絡
                    value: '',
                    view:  order_remark
                }
            ];
        }.bind(this) );
    },

    onClickSearchButton: function() {
        this.state.selected = 0;
        this.onSearch();
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
                       label="承認待"
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
                       label="発注済"
                       checked={this.state.is_ordered}
                       onChange={this.onChangeCheckbox}
                       ref="ordered" />
              </div>
              <div className="list-orders-checkbox">
                <Input type="checkbox"
                       label="納品済"
                       checked={this.state.is_delivered}
                       onChange={this.onChangeCheckbox}
                       ref="delivered" />
              </div>
              <div className="list-orders-checkbox-short">
                <Input type="checkbox"
                       label="無効"
                       checked={this.state.is_nullified}
                       onChange={this.onChangeCheckbox}
                       ref="nullified" />
              </div>
              <div className="list-orders-checkbox-short">
                <Input type="checkbox"
                       label="欠番"
                       checked={this.state.is_vacant}
                       onChange={this.onChangeCheckbox}
                       ref="vacant" />
              </div>
              <div className="list-orders-checkbox">
                <Input type="checkbox"
                       label="完了"
                       checked={this.state.is_completed}
                       onChange={this.onChangeCheckbox}
                       ref="completed" />
              </div>
              <div id="list-orders-search-lower-row">
              <div id="list-orders-additional-conditions">
                <Input type="text"
                       id="list-orders-order-code"
                       onChange={this.onChangeOrderCode}
                       placeholder="起案番号"
                       value={this.state.order_code}
                       ref="order_code" />
                <Select placeholder="発注先 販売元"
                        onSelect={this.onSelectTrader}
                        value={this.state.trader_code}
                        options={this.state.traders} />
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
                        onClick={this.onClickSearchButton}>
                  検索
                </Button>
              </div>
              </div>
            </fieldset>
        );
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
            purpose:         'FAX',
            order_code:      order.order_code,
            order_type:      order.order_type,
            order_remark:    order.order_remark,
            department:      department_name + ' (' + department_tel + ') ',
            trader:          order.trader_name,
            drafting_date:   order.drafting_date,
            submission_date: moment().format('YYYY/MM/DD'),
            products:        order.products.map(function(p) {
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
            var is_approved  = order.order_state       === 'APPROVED';
            var is_unordered = order.products[0].state === 'UNORDERED';

            if (is_approved && is_unordered) {
                this.toOrdered(order);

                if (order.order_type != 'URGENCY_ORDER') {
                    orders.push(this.toSheetInfo(order) );
                }
            }
        }.bind(this) );

        if (orders.length > 0) {
            window.orders = orders;
            window.open('preview-all-orders.html');
        } else {
            alert('印刷対象の発注はありません。');
        }

        this.onSearch();
    },

    uniq: function(a) {
        return a.filter(function(e, i) {
            return a.indexOf(e) == i;
        });
    },

    onChangeDepartmentFilterText: function(e) {
        this.setState({ department_filter_text: e.target.value });
    },

    onChangeTraderFilterText: function(e) {
        this.setState({ trader_filter_text: e.target.value });
    },

    componentDidMount: function() {
        XHR.get('/tellAllTraders').set({
            'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT'
        }).end(function(err, res) {
            if (err != null) {
                alert(Messages.ajax.LIST_ORDERS_TELL_ALL_TRADERS);
                throw 'ajax_tellAllTraders';
            }

            if (res.body.status != 0) {
                alert(Messages.server.LIST_ORDERS_TELL_ALL_TRADERS);
                throw 'server_tellAllTraders';
            }

            var traders = res.body.traders.map(function(t) {
                return {
                    code: t.code,
                    name: t.name
                };
            });

            traders.unshift({ code: '', name: '-- 指定しない --' });

            this.setState({ traders: traders });
        }.bind(this) );
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

        var departments = [];
        var traders     = [];

        this.state.orders.forEach(function(o) {
            departments.push(o.department_name);
            traders.push(o.trader_name);
        });

        departments = this.uniq(departments);
        traders     = this.uniq(traders);

        return (
            <div id="list-orders" ref="listOrders">
              {this.generateSearchPain()}
              <fieldset id="list-orders-table-frame">
                <legend>発注一覧</legend>
                <FilterTextInputs
                  id="list-orders-filter-text-inputs"
                  valueOfDepartment={this.state.department_filter_text}
                  onChangeDepartment={this.onChangeDepartmentFilterText}
                  valueOfTrader={this.state.trader_filter_text}
                  onChangeTrader={this.onChangeTraderFilterText}
                  departments={departments}
                  traders={traders} />
                <TableFrame id="list-orders-orders"
                            title={title}
                            data={data}
                            scrollTopIndex={this.state.selected} />
              </fieldset>
              {print_all}
            </div>
        );
    }
});

module.exports = ListOrders;
