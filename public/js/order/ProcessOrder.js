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
        /*
        * 請求確定した場合、物品の状態として請求確定した日付が入る。
        * 本来なら、物品の状態と請求確定日は別項目にすべきなのだが、請求確定日
        * なる情報が必要だと判明したのが、システム運用後。
        * しょうがないので、苦肉の策として状態に日付 (yyyy/mm/dd) が入っていた
        * ら、それは請求確定の状態であり、その日付を請求確定日とすることにした。
        * もうダメダメ ...
        */
        return (
            <TableFrame.Select initialSelected={this.props.initialSelected}
                               onSelect={this.props.onSelect}>
              <TableFrame.Option value="ORDERED">
                発注済
              </TableFrame.Option>
              <TableFrame.Option value="CANCELED">
                キャンセル
              </TableFrame.Option>
              <TableFrame.Option value="DELIVERED">
                納品済
              </TableFrame.Option>
              <TableFrame.Option value="PARTIAL-DELIVERED">
                分納
              </TableFrame.Option>
            </TableFrame.Select>
        );
    }
});

var OrderNotices = React.createClass({
    PropTypes: { order: React.PropTypes.object.isRequired },

    render: function() {
        return (
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
            <Notice className="process-order-notice" title="発注先 販売元">
             {this.props.order.trader_name}
            </Notice>
            <Notice id="process-order-department" title="発注元 部門診療科">
              {this.props.order.department_name}
            </Notice>
          </div>
        );
    }
});

var OrderTotals = React.createClass({
    propTypes: {
        order_total:   React.PropTypes.number.isRequired,
        billing_total: React.PropTypes.number.isRequired
    },

    render: function() {
        return (
            <div id="process-order-totals">
              <Notice className="process-order-total" title="発注総計">
                {Math.round(this.props.order_total).toLocaleString()}
              </Notice>
              <Notice className="process-order-total" title="請求総計">
                {Math.round(this.props.billing_total).toLocaleString()}
              </Notice>
            </div>
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
        toOrdered:            React.PropTypes.func.isRequired,
        toDelivered:          React.PropTypes.func.isRequired,
        onApprove:            React.PropTypes.func.isRequired,
        onDeny:               React.PropTypes.func.isRequired,
        onRevertToRequesting: React.PropTypes.func.isRequired,
        onPrint:              React.PropTypes.func.isRequired,
        onFix:                React.PropTypes.func.isRequired,
        onRevertToApproved:   React.PropTypes.func.isRequired,

        is_unordered: React.PropTypes.bool.isRequired,
        need_save:    React.PropTypes.bool.isRequired
    },

    render: function() {
        var buttons = [
            <Button key="0"
                    bsSize="large"
                    bsStyle="primary"
                    className="process-order-button"
                    onClick={this.props.goBack}>
              戻る
            </Button>
        ];

        switch (this.props.permission) {
        case 'APPROVE':
            buttons.push(
                <Button key="1"
                        bsSize="large"
                        bsStyle="primary"
                        className="process-order-button"
                        onClick={this.props.onApprove}>
                  承認
                </Button>
            );
            buttons.push(
                <Button key="2"
                        bsSize="large"
                        bsStyle="primary"
                        className="process-order-button"
                        onClick={this.props.onDeny}>
                  差し戻し 
                </Button>
            );
            break;
        case 'BACK_TO_REQUESTING':
            buttons.push(
                <Button key="3"
                        bsSize="large"
                        bsStyle="primary"
                        className="process-order-button"
                        onClick={this.props.onRevertToRequesting}>
                  依頼中に戻す
                </Button>
            );
            break;
        case 'PROCESS':
            if (this.props.is_unordered) {
                buttons.push(
                    <Button key="4"
                            bsSize="large"
                            bsStyle="primary"
                            className="process-order-button"
                            onClick={this.props.toOrdered}>
                      発注済へ
                    </Button>
                );
            } else {
                buttons.push(
                    <Button key="5"
                            bsSize="large"
                            bsStyle="primary"
                            className="process-order-button"
                            onClick={this.props.toDelivered}>
                      全て納品済みに
                    </Button>
                );
            }

            buttons.push(
                <Button key="6"
                        bsSize="large"
                        bsStyle="primary"
                        className="process-order-button"
                        onClick={this.props.onPrint}
                        disabled={this.props.need_save}>
                  印刷
                </Button>
            );
            buttons.push(
                <Button key="7"
                        bsSize="large"
                        bsStyle="primary"
                        className="process-order-button"
                        onClick={this.props.onFix}
                        disabled={!this.props.need_save}>
                  確定
                </Button>
            );
            break;
        case 'BACK_TO_APPROVED':
            buttons.push(
                <Button key="8"
                        bsSize="large"
                        bsStyle="primary"
                        className="process-order-button"
                        onClick={this.props.onPrint}>
                  印刷
                </Button>
            );
            buttons.push(
                <Button key="9"
                        bsSize="large"
                        bsStyle="primary"
                        className="process-order-button"
                        onClick={this.props.onFix}
                        disabled={!this.props.need_save}>
                  完了日変更
                </Button>
            );
            buttons.push(
                <Button key="10"
                        bsSize="large"
                        bsStyle="primary"
                        className="process-order-button"
                        onClick={this.props.onRevertToApproved}>
                  納品済へ戻す
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
            order_state:    this.props.order.order_state,
            order_remark:   this.props.order.order_remark,
            order_version:  this.props.order.order_version,
            completed_date: this.props.order.completed_date,
            products:       products,
            need_save:      false
        };
    },

    /*
     * 「納品済」状態を示す文字列の正規表現。
     * 納品日に加え、請求単価も記録する。
     * dirty hack の極み。
     * 死にたい。
     */
    regex_delivered: /^(\d{4}\/\d{2}\/\d{2})\s+(\d+(\.\d+)?)$/,

    toOrdered: function() {
        this.state.products.forEach(function(p) {
            p.state = 'ORDERED';
        });

        this.setState({
            products:  this.state.products,
            need_save: true
        });
    },

    toDelivered: function() {
        var date = moment().format('YYYY/MM/DD');

        this.state.products.forEach(function(p) {
            if (p.state === 'ORDERED') {
                var subtotal = p.cur_price * p.quantity;

                p.state          = date + ' ' + p.cur_price;
                p.billing_amount = Math.round(subtotal);
            }
        });

        this.setState({
            products:  this.state.products,
            need_save: true
        });
    },

    onChangeRemark: function(e) {
        this.setState({
            order_remark: e.target.value,
            need_save:    true
        });
    },

    changeOrderState: function(order_state, next) {
        XHR.post('changeOrderState').send({
            order_id:      this.props.order.order_id,   // 不要
            order_code:    this.props.order.order_code,
            order_state:   order_state,
            order_remark:  this.state.order_remark,
            order_version: this.state.order_version
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.PROCESS_ORDER_CHANGE_ORDER_STATE);
                throw 'ajax_changeOrderState';
            }

            if (res.body.status > 1) {
                alert(Messages.server.PROCESS_ORDER_CHANGE_ORDER_STATE);
                throw 'server_changeOrderState';
            }

            if (res.body.status == 0) {
                alert('完了しました。');
            } else {
                alert(Messages.information.UPDATE_CONFLICT);
            }

            if (next === 'back') {
                this.props.goBack();
            } else {
                this.setState({
                    order_state:   order_state,
                    order_version: this.state.order_version + 1
                });
            }
        }.bind(this) );
    },

    onApprove: function() {
        if (confirm('この発注を承認します。よろしいですか?') ) {
            this.changeOrderState('APPROVED', 'back');
        }
    },

    onDeny: function() {
        if (confirm('この発注を差し戻します。よろしいですか?') ) {
            this.changeOrderState('REQUESTING', 'back');
        }
    },

    onRevertToRequesting: function() {
        if (confirm('この発注を「依頼中」に戻します。よろしいですか?') ) {
            this.changeOrderState('REQUESTING', 'back');
        }
    },

    onRevertToApproved: function() {
        if (confirm('この発注を「納品済」に戻します。よろしいですか?') ) {
            this.changeOrderState('APPROVED', 'here');
        }
    },

    onPrint: function() {
        var order           = this.props.order;
        var department_name = order.department_name;
        var department_tel  = order.department_tel;

        var info = {
            order_code:    order.order_code,
            order_type:    order.order_type,
            order_remark:  this.state.order_remark,
            trader:        order.trader_name,
            drafting_date: order.drafting_date,
        };


        /*
         * 納品済若しくはキャンセルの物品が一つでもあれば、ハンコリレーの
         * 紙 (発注書) を印刷する。
         * そうでなければ、FAX 用の紙。
         */
        var delivered_products = this.state.products.filter(function(p) {
            if (p.state === 'CANCELED') {
                return true;
            } else if (p.state.match(this.regex_delivered) ) {
                return true;
            } else {
                return false;
            }
        }.bind(this) );

        if (delivered_products.length > 0) {
            info.submission_date = this.state.completed_date; 

            if (info.submission_date === '') {
                info.submission_date = moment().format('YYYY/MM/DD');
            }
                
            info.purpose    = 'APPROVAL',
            info.department = department_name,
            info.products   = this.state.products.map(function(p) {
                var matched = p.state.match(this.regex_delivered);
                var price;
                var billing_amount;
                var delivered_date = null;

                if (matched) {
                    price          = parseFloat(matched[2]);
                    billing_amount = p.billing_amount;
                    delivered_date = matched[1];
                } else if (p.state === 'CANCELED') {
                    price = billing_amount = 0;
                } else {
                    price          = p.cur_price;
                    billing_amount = p.cur_price * p.quantity;
                }

                return {
                    name:           p.name,
                    maker:          p.maker,
                    quantity:       p.quantity,
                    price:          price,
                    billing_amount: billing_amount,
                    state:          p.state,
                    delivered_date: delivered_date
                };
            }.bind(this) );

            window.info = info;
            window.open('preview-order.html');
        } else {
            info.purpose    = 'FAX';
            info.department = department_name + ' (' + department_tel + ')';

            info.submission_date = moment().format('YYYY/MM/DD'),
            info.products        = order.products.map(function(p) {
                return {
                    name:     p.name,
                    maker:    p.maker,
                    quantity: p.quantity,
                    price:    p.cur_price
                };
            });

            window.info = info;
            window.open('preview-order.html');
        }
    },

    decideOrderState: function() {
        var order_state     = this.state.order_state;
        var num_of_products = this.state.products.length;

        var num_of_canceled = this.state.products.filter(function(p) {
            return p.state === 'CANCELED';
        }).length;

        var num_of_delivered = this.state.products.filter(function(p) {
            return p.state.match(this.regex_delivered);
        }.bind(this) ).length;

        if (num_of_products == num_of_canceled) {
            order_state = 'NULLIFIED';
        } else if (num_of_products == num_of_canceled + num_of_delivered) {
            order_state = 'COMPLETED';
        }

        return order_state;
    },

    makePostDataOfOrder: function() {
        return {
            order_id:        this.props.order.order_id, // 不要
            order_code:      this.props.order.order_code,
            order_state:     this.decideOrderState(),
            order_remark:    this.state.order_remark,
            order_version:   this.state.order_version,
            department_code: this.props.order.department_code,
            trader_code:     this.props.order.trader_code,

            products: this.state.products.map(function(p) {
                return {
                    code:           p.code,
                    price:          p.cur_price,
                    quantity:       p.quantity,
                    state:          p.state,
                    billing_amount: p.billing_amount
                };
            }),

            completed_date: this.state.completed_date
        };
    },

    onFix: function() {
        if (confirm('この発注を確定します。よろしいですか?') ) {
            var data = this.makePostDataOfOrder();

            XHR.post('updateOrder').send(data).end(function(err, res) {
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
                    this.setState({ need_save: false });
                } else {
                    alert(Messages.information.UPDATE_CONFLICT);
                }
            }.bind(this) );
        }
    },

    onChangePaidPrice: function(index, delivered_date) {
        return function(paid_price) {
            var product = this.state.products[index];

            product.state = delivered_date + ' ' + paid_price;

            this.setState({
                products:  this.state.products,   
                need_save: true
            });
        }.bind(this);
    },

    onChangeBillingAmount: function(index) {
        return function(billing_amount) {
            var product = this.state.products[index];

            product.billing_amount = billing_amount;

            this.setState({
                products:  this.state.products,
                need_save: true
            });
        }.bind(this);
    },

    onChangeProductState: function(index) {
        return function(e) {
            var current   = this.state.products[index];
            var new_state = e.target.value;

            switch (new_state) {
            case 'PARTIAL-DELIVERED':
                var n = parseInt(prompt('いくつ「納品済」にしますか?') );
                
                if (n != n || n <= 0 || n >= current.quantity) {
                    alert('数量未満の自然数を入力して下さい。');
                    return;
                }

                /*
                 * 分納される場合に対応するため、一部の物品だけ納品済にして、
                 * 残りは元の状態のままにする。
                 * 以下で、元の状態のままにする方を (分割して) 一覧の最後に
                 * 加える。
                 */
                this.state.products.push({
                    code:           current.code,
                    name:           current.name,
                    maker:          current.maker,
                    min_price:      current.min_price,
                    cur_price:      current.cur_price,
                    max_price:      current.max_price,
                    quantity:       current.quantity - n,
                    state:          current.state,
                    billing_amount: 0
                });


                /*
                 * こちらが納品済にする方。
                 * ただ、実際に状態を変更するのはこの switch 文を抜けた直後。
                 * ここでは、new_state を納品済に変更するだけにとどめる。
                 * 通常の納品済と同じ手続きを踏むため、以下で break していな
                 * いことに注意。
                 */
                current.quantity = n;
                // FALL THRU
            case 'DELIVERED':
                /*
                 * 日付の後に請求単価が入っていることに注意。
                 * この時点では請求単価は入力されていないため、
                 * 取り敢えず単価 (定価) を入力している。
                 *
                 * 何故これほど愚かしいことをしているのかと言うと、
                 * システムの運用後、請求単価なる値を各発注の物品毎に記録
                 * する必要があることが発覚したため。
                 * しかし、それを記録するフィールドがないため、苦肉の策
                 * (最近こんなんばっか) として、請求確定状態を示す日付けの
                 * 後に数値として記録することにした。
                 * ダメの極み。
                 */
                var date     = moment().format('YYYY/MM/DD');
                var subtotal = current.cur_price * current.quantity;

                new_state              = date + ' ' + current.cur_price;
                current.billing_amount = Math.round(subtotal);


                /*
                 * 納品済にした時点で、請求単価を入力するための input 要素に
                 * フォーカスを当てるようにしたいのだが、この時点では未だ
                 * その要素は作成されていない (作成されるのは、この後の
                 * setState が呼ばれた後)。
                 * そのため、この時点ではフォーカスを当てるための ref を指定
                 * しておくに留め、実際にフォーカスを当てる操作を
                 * componentDidUpdate に任せることにする。
                 */
                this.focus = 'paid_price' + index.toString();

                break;
            default: 
                current.billing_amount = 0;

                if (index < this.props.order.products.length) {
                    /*
                     * 分納で分割された側は props の中にはない。
                     * その場合 cur_price と billing_amount はそのまま。
                     * 分納で納品済みになる側は props の中にあるため、
                     * cur_price を元に戻す。
                     */
                    var original = this.props.order.products[index];
                    current.cur_price = original.cur_price;
                }

                break;
            }

            this.state.products[index].state = new_state;

            var completed_date = this.state.completed_date;
            var order_state    = this.decideOrderState();

            if (order_state === 'COMPLETED' && completed_date === '') {
                completed_date = moment().format('YYYY/MM/DD');
            } else if (order_state != 'COMPLETED' && completed_date != '') {
                completed_date = '';
            }

            this.setState({
                products:       this.state.products,
                completed_date: completed_date,
                need_save:      true
            });
        }.bind(this);
    },

    onChangeDeliveredDate: function(index) {
        return function(date) {
            var product      = this.state.products[index];
            var is_delivered = product.state.match(this.regex_delivered);

            // if (is_delivered && date != null) {
            if (date.match(/^\d{4}\/\d{2}\/\d{2}$/) ) {
                var paid_price = is_delivered[2].toLocaleString('ja-JP', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                });

                // product.state = date.format('YYYY/MM/DD') + ' ' + paid_price;
                product.state = date + ' ' + paid_price;

                this.setState({
                    products:  this.state.products,
                    need_save: true
                });
            }
        }.bind(this);
    },

    decidePermission: function() {
        var can_approve       = false;
        var can_process_order = false;

        /*
         * 院務部のアカウント inmu は、全部門診療科の発注を参照できるが、
         * 変更はできない特殊なユーザ。
         * 手っ取り早く実現するため、inmu に pririleged.approve を与え、
         * 全部門診療科の発注の一覧を取得できるようにする。
         * ただ、そのままだと発注を承認 / 差し戻しできてしまうため、
         * 
         *   user.account === 'inmu'
         *
         * をマジックナンバーとして扱い、その場合だけ特別に
         * 
         *   permission = 'REFER_ONLY'
         *
         * として、承認 / 差し戻しできなくする。
         * 最低最悪の adhock hack だが、仕方ない ...
         */
        if (this.props.user.account === 'inmu') {
            return 'REFER_ONLY';
        }

        if (this.props.user.privileged.approve) {
            can_approve = true;
        }

        if (this.props.user.privileged.process_order) {
            can_process_order = true;
        }

        this.props.user.departments.forEach(function(d) {
            if (d.code === this.props.order.department_code) {
                if (d.approve) {
                    can_approve = true;
                }

                if (d.process_order) {
                    can_process_order = true;
                }
            }
        }.bind(this) );

        var permission  = 'REFER_ONLY';
        var order_state = this.state.order_state;


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

        return permission;
    },

    makeTableFrameTitle: function() {
        return [
            { name: 'No.',         type: 'void' },
            { name: '品名',        type: 'void' },
            { name: '製造元',      type: 'void' },
            { name: '単価 (定価)', type: 'void' },
            { name: '数量',        type: 'void' },
            { name: '発注小計',    type: 'void' },
            { name: '請求単価',    type: 'void' },
            { name: '請求額',      type: 'void' },
            { name: '納品日',      type: 'void' },
            { name: '状態',        type: 'void' }
        ];
    },

    composeTableFrameDataRow: function(permission, product, index) {
        var subtotal = product.cur_price * product.quantity;

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

        var subtotal_view = subtotal.toLocaleString('ja-JP', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });

        var billing_amount_view = product.billing_amount.toLocaleString();
        var state_view          = Util.toProductStateName(product.state);
        var paid_price          =  0;
        var paid_price_view     = "0";
        var delivered_date      = null;
        var delivered_date_view = null;
        var is_delivered        = product.state.match(this.regex_delivered);

        if (is_delivered) {
            delivered_date  = delivered_date_view = is_delivered[1];
            paid_price      = parseFloat(is_delivered[2]);
            paid_price_view = paid_price.toLocaleString('ja-JP', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });
        }

        if (permission === 'PROCESS' && product.state != 'UNORDERED') {
            var initial_selected = product.state;

            if (is_delivered) {
                initial_selected = 'DELIVERED';

                var paid_price_string = paid_price.toLocaleString('ja-JP', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                });

                paid_price_view = (
                    <TableFrame.Input
                      type='real'
                      placeholder={paid_price_string}
                      onChange={this.onChangePaidPrice(index, delivered_date)}
                      ref={'paid_price' + index.toString()} />
                );

                /*
                delivered_date_view = (
                    <TableFrame.DatePicker 
                      selected={moment(delivered_date, 'YYYY/MM/DD')}
                      onChange={this.onChangeDeliveredDate(index)} />
                );
                */
                
                delivered_date_view = (
                    <TableFrame.Input
                      type='date'
                      placeholder={delivered_date}
                      onChange={this.onChangeDeliveredDate(index)} />
                );

                billing_amount_view = (
                    <TableFrame.Input
                      type='int'
                      placeholder={billing_amount_view}
                      onChange={this.onChangeBillingAmount(index)}
                      ref={"billing_amount" + index.toString()} />
                );
            }
                
            state_view = (
                <SelectProductState
                  initialSelected={initial_selected}
                  onSelect={this.onChangeProductState(index)} />
            );
        }

        return [
            { value: index + 1,     view: index + 1     },
            { value: product.name,  view: product.name  },
            { value: product.maker, view: product.maker },
            {
                value: product.cur_price,
                view:  cur_price_view
            },
            {
                value: product.quantity, 
                view:  product.quantity.toLocaleString()
            },
            { value: subtotal, view: subtotal_view },
            {
                value: paid_price,
                view:  paid_price_view
            },
            {
                value: product.billing_amount,
                view:  billing_amount_view
            },
            {
                value: delivered_date,
                view:  delivered_date_view
            },
            {
                value: product.state,
                view:  state_view
            }
        ];
    },

    decideLegend: function(permission) {
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

        return legend;
    },

    onChangeCompletedDate: function(date) {
        this.setState({
            completed_date: date.format('YYYY/MM/DD'),
            need_save:      true
        });
    },

    componentDidUpdate: function() {
        if (this.focus != null) {
            ReactDOM.findDOMNode(this.refs[this.focus]).select();
            this.focus = null;
        }
    },

    render: function() {
        var permission  = this.decidePermission();
        var table_title = this.makeTableFrameTitle();

        var order_total   = 0.0;
        var billing_total = 0.0;

        var table_data = this.state.products.map(function(product, index) {
            if (product.state != 'CANCELED') {
                order_total += product.cur_price * product.quantity;
            }

            if (product.state.match(this.regex_delivered) ) {
                billing_total += product.billing_amount;
            }

            return this.composeTableFrameDataRow(permission, product, index);
        }.bind(this) );

        var completed_date = this.state.completed_date;

        if (this.decideOrderState() === 'COMPLETED') {
            var selected_date = moment();

            if (completed_date != '') {
                selected_date = moment(completed_date, 'YYYY/MM/DD');
            }

            completed_date = (
                <TableFrame.DatePicker selected={selected_date}
                                       onChange={this.onChangeCompletedDate} />
            );
        } else if (completed_date === '') {
            completed_date = '未完了です';
        }

        var is_unordered = this.state.products[0].state === 'UNORDERED';

        return (
            <div id="process-order">
              <fieldset>
                <legend>{this.decideLegend(permission)}</legend>
                  <OrderNotices order={this.props.order} />
                  <Input id="process-order-remark"
                         type="text"
                         bsSize="small"
                         placeholder="備考・連絡"
                         value={this.state.order_remark}
                         disabled={permission === 'REFER_ONLY'}
                         onChange={this.onChangeRemark} />
              </fieldset>
              <TableFrame id="process-order-products"
                          title={table_title}
                          data={table_data} />
              <OrderTotals order_total={order_total}
                           billing_total={billing_total} />
              <Notice id="process-order-completed-date" title="完了日">
                {completed_date}
              </Notice>
              <Buttons key={Math.random()}
                       permission={permission}
                       goBack={this.props.goBack}
                       toOrdered={this.toOrdered}
                       toDelivered={this.toDelivered}
                       onApprove={this.onApprove}
                       onDeny={this.onDeny}
                       onRevertToRequesting={this.onRevertToRequesting}
                       onPrint={this.onPrint}
                       onFix={this.onFix}
                       onRevertToApproved={this.onRevertToApproved}
                       is_unordered={is_unordered}
                       need_save={this.state.need_save} />
            </div>
        );
    }
});

module.exports = ProcessOrder;
