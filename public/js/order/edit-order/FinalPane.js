/*
 * 確定ペイン
 */
'use strict';
var React      = require('react');
var ReactDOM   = require('react-dom');
var Button     = require('react-bootstrap').Button;
var Input      = require('react-bootstrap').Input;
var Fluxxor    = require('fluxxor');
var XHR        = require('superagent');
var Notice     = require('../../components/Notice');
var TableFrame = require('../../components/TableFrame');
var Messages   = require('../../lib/Messages');
var Util       = require('../../lib/Util');

var FinalistName = React.createClass({
    mixins:    [ Fluxxor.FluxMixin(React) ],

    propTypes: {
        index: React.PropTypes.number.isRequired,
        state: React.PropTypes.oneOf([
            'UNORDERED',
            'ORDERED',
            'CANCELED',
            'DELIVERED'
        ]).isRequired,
    },

    onSelectFinalist: function() {
        return this.getFlux().actions.removeFinalist({
            index: this.props.index
        });
    },

    render: function() {
        /*
         * 削除できるのは未発注の物品のみ
         */
        if (this.props.state === 'UNORDERED') {
            return (
                <div className='final-pane-finalist-name'
                     onClick={this.onSelectFinalist}>
                  {this.props.children}
                </div>
            );
        }

        return <span>{this.props.children}</span>;
    }
});

var ButtonForNextAction = React.createClass({
    mixins: [ Fluxxor.FluxMixin(React) ],

    propTypes: {
        onFix:        React.PropTypes.func.isRequired,
        onPrint:      React.PropTypes.func.isRequired,
        needSave:     React.PropTypes.bool.isRequired,
        orderCode:    React.PropTypes.string.isRequired,
        orderVersion: React.PropTypes.number.isRequired,
        trader:       React.PropTypes.object.isRequired,
        goBack:       React.PropTypes.func
    },

    eraseOrder: function() {
        if (confirm("この発注を消去します。よろしいですか?") ) {
            XHR.post('eraseOrder').send({
                order_id:      this.props.orderId,  // 不要
                order_code:    this.props.orderCode,
                order_version: this.props.orderVersion
            }).end(function(err, res) {
                if (err) {
                    alert(Messages.ajax.FINAL_PANE_ERASE_ORDER);
                    throw 'ajax_eraseOrder';
                }

                if (res.body.status > 1) {
                    alert(Messages.server.FINAL_PANE_ERASE_ORDER);
                    throw 'server_eraseOrder';
                }

                if (res.body.status == 0) {
                    alert('消去しました。');
                } else {
                    alert(Messages.information.UPDATE_CONFLICT);
                }

                if (this.props.goBack == null) {
                    this.getFlux().actions.resetOrder();
                } else {
                    this.props.goBack();
                }
            }.bind(this) );
        }
    },

    render: function() {
        if (this.props.orderCode != '' && this.props.trader.code === '') {
            /*
             * 既存の発注 (起案番号が付与された発注） の発注確定一覧を
             * 空にした状態で updateOrder を発行すると、その発注を消去する
             * ことができる (但し、実際に DB から消去する訳ではない。
             * DB によって検索対象から外されるため、ユーザからは消去された
             * ように見える)。
             *
             * 発注確定一覧が空になると 販売元コード (trader.code)
             * も空文字になる。つまり、trader.code === '' が真だと、finalists
             * が空ということになる。
             * ここに来るということは即ち、起案番号は付与された状態で、
             * 且つ発注確定一覧 （finalists) を空、という状態である。
             */
             return (
                <Button bsSize="large"
                        bsStyle="primary"
                        className="final-pane-button"
                        onClick={this.eraseOrder}>
                  消去
                </Button>
             );
        } else if (this.props.needSave) {
            return (
                <Button onClick={this.props.onFix}
                        bsSize="large"
                        bsStyle="primary"
                        className="final-pane-button"
                        disabled={this.props.trader.code === ''}>
                  確定
                </Button>
            );
        }

        return (
            <Button bsSize="large"
                    bsStyle="primary"
                    className="final-pane-button"
                    onClick={this.props.onPrint}>
              提出 
            </Button>
        );
    }
});

var FinalPane = React.createClass({
    mixins: [ Fluxxor.FluxMixin(React) ],

    propTypes: {
        user:         React.PropTypes.object.isRequired,
        orderCode:    React.PropTypes.string.isRequired,
        orderRemark:  React.PropTypes.string.isRequired,
        orderVersion: React.PropTypes.number.isRequired,
        draftingDate: React.PropTypes.string.isRequired,
        orderType:    React.PropTypes.string.isRequired,
        drafter:      React.PropTypes.string.isRequired,

        department: React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        }),

        trader: React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        }).isRequired,

        finalists: React.PropTypes.arrayOf(React.PropTypes.shape({
            code:     React.PropTypes.string.isRequired,
            name:     React.PropTypes.string.isRequired,
            maker:    React.PropTypes.string.isRequired,
            price:    React.PropTypes.number.isRequired,
            quantity: React.PropTypes.number.isRequired,
            state:    React.PropTypes.oneOf([
                'UNORDERED',
                'ORDERED',
                'CANCELED',
                'DELIVERED'
            ]).isRequired
        }) ).isRequired,

        needSave: React.PropTypes.bool.isRequired,
        goBack:   React.PropTypes.func
    },


    /*
     * クリアボタンがクリックされたら
     */
    onClear: function() {
        return this.getFlux().actions.clearFinalists();
    },

    validateQuantities: function() {
        for (var i = 0; i < this.props.finalists.length; i++) {
            var q = this.props.finalists[i].quantity;


            /*
             * 以下の q != q は、q が NaN か否かを判定している。
             * NaN はあらゆる値と等しくない (NaN 自身とすら等しくない) ため、
             * q != q が真となるのは q が NaN の場合だけ。
             *
             * 数値入力欄では負数を指定できるよう '-' の入力を許している訳
             * だが、'-' だけ入力した場合、parseInt() / parseFloat() で NaN
             * となってしまう。
             * q != q はそれを検知するための条件判定。
             */
            if (q == 0 || q != q) {
                alert('数量を指定して下さい。');
                var e = this.refs['quantity' + i.toString()];
                ReactDOM.findDOMNode(e).select();
                return false;
            }
        }

        return true;
    },

    canProcessOrder: function() {
        if (this.props.user.privileged.process_order) {
            return true;
        } else {
            for (var i = 0; i < this.props.user.departments.length; i++) {
                var d = this.props.user.departments[i];

                if (d.code === this.props.department.code && d.process_order) {
                    return true;
                }
            }
        }

        return false;
    },


    /*
     * 発注を新規登録
     */
    registerOrder: function() {
        XHR.post('registerOrder').send({
            order_type:      this.props.orderType,
            order_remark:    this.props.orderRemark,
            department_code: this.props.department.code,
            trader_code:     this.props.trader.code,

            products: this.props.finalists.map(function(p) {
                return {
                    code:     p.code,
                    quantity: p.quantity
                };
            })
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.FINAL_PANE_REGISTER_ORDER);
                throw 'ajax_registerOrder';
            }

            if (res.body.status != 0) {
                alert(Messages.server.FINAL_PANE_REGISTER_ORDER);
                throw 'server_registerOrder';
            }

            alert('登録しました。');
            this.getFlux().actions.setOrderCodeAndVersion({
                id:      res.body.order_id, // 不要 (MySQL の場合のみ必要)
                code:    res.body.order_code,
                version: res.body.order_version
            });


            /*
             * 発注の起案権限しかないユーザは、
             * 以降発注を変更することはできない
             */
            if (!this.canProcessOrder() ) {
                if (this.props.goBack === undefined) {
                    /*
                     * ナビゲーションバーの *発注起案から飛んで来た場合、
                     * 戻り先ページは無いので、連続で発注を起案できるよう
                     * ページを初期化する。
                     */
                    this.getFlux().actions.resetOrder();
                } else {
                    /*
                     * 発注一覧から飛んで来た場合は、発注一覧へ戻る。
                     */
                    this.props.goBack();
                }
            }
        }.bind(this) );
    },


    /*
     * 登録済み若しくは既存の発注を更新
     */
    updateOrder: function() {
        XHR.post('updateOrder').send({
            order_id:        this.props.orderId,    // 不要
            order_code:      this.props.orderCode,
            order_state:     'REQUESTING',
            order_remark:    this.props.orderRemark,
            order_version:   this.props.orderVersion,
            department_code: this.props.department.code,
            trader_code:     this.props.trader.code,
            
            products: this.props.finalists.map(function(p) {
                return {
                    code:           p.code,
                    price:          p.price,
                    quantity:       p.quantity,
                    state:          p.state,
                    billing_amount: p.billing_amount
                };
            }),

            completed_date: ''
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.FINAL_PANE_UPDATE_ORDER);
                throw 'ajax_updateOrder';
            }

            if (res.body.status > 1) {
                alert(Messages.server.FINAL_PANE_UPDATE_ORDER);
                throw 'server_updateOrder';
            }

            if (res.body.status == 0) {
                alert('更新しました。');
                this.getFlux().actions.fixFinalists({
                    version: res.body.order_version
                });
            } else {
                alert(Messages.information.UPDATE_CONFLICT);

                if (this.props.goBack === undefined) {
                    this.getFlux().actions.resetOrder();
                } else {
                    this.props.goBack();
                }
            }
        }.bind(this) );
    },


    /*
     * 確定ボタンがクリックされたら
     */
    onFix: function() {
        if (!this.validateQuantities() ) {
            return;
        }

        if (this.props.orderCode === '') {
            this.registerOrder();
        } else {
            this.updateOrder();
        }
    },


    /*
     * 印刷ボタンがクリックされたら
     */
    onPrint: function() {
        XHR.post('changeOrderState').send({
            order_id:      this.props.orderId,  // 不要 (MySQL の場合のみ必要)
            order_code:    this.props.orderCode,
            order_state:   'APPROVING',
            order_remark:  this.props.orderRemark,
            order_version: this.props.orderVersion
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.FINAL_PANE_CHANGE_ORDER_STATE);
                throw 'ajax_changeOrderState';
            }

            if (res.body.status > 1) {
                alert(Messages.server.FINAL_PANE_CHANGE_ORDER_STATE);
                throw 'server_changeOrderState';
            }

            if (res.body.status == 0) {
                alert('承認待ちになりました。');
                window.info = {
                    purpose:       'APPROVAL',
                    order_code:    this.props.orderCode,
                    department:    this.props.department.name,
                    trader:        this.props.trader.name,
                    drafting_date: this.props.draftingDate,
                    order_date:    '',
                    products:      this.props.finalists
                };

                window.open('preview-order.html', '発注書 印刷プレビュー');
            } else {
                alert(Messages.information.UPDATE_CONFLICT);
            }

            if (this.props.goBack === undefined) {
                this.getFlux().actions.resetOrder();
            } else {
                this.props.goBack();
            }
        }.bind(this) );
    },


    /*
     * 発注確定一覧の数量が変更されたら呼び出される、
     * コールバック関数を返す関数。
     * コールバック関数そのものではないことに注意。
     * クロージャで、発注確定一覧 (配列) のインデックス == index を保持して、
     * 当該物品の数量を変更できるようにしている。
     */
    onChangeQuantity: function(index) {
        return function(quantity) {
            return this.getFlux().actions.changeQuantity({
                index: index,
                value: quantity
            });
        }.bind(this);
    },

    onChangeRemark: function(e) {
        return this.getFlux().actions.setOrderRemark({
            remark: e.target.value
        });
    },

    makeTableFrameTitle: function() {
        return [
            { name: '品名',     type: 'string' },
            { name: '製造元',   type: 'string' },
            { name: '現在単価', type: 'number' },
            { name: '数量',     type: 'number' },
            { name: '発注小計', type: 'number' },
            { name: '状態',     type: 'string' }
        ];
    },

    makeTableFrameDataRow: function(finalist, index) {
        var state    = Util.toProductStateName(finalist.state);
        var subtotal = finalist.price * finalist.quantity;

        var price_string = finalist.price.toLocaleString('ja-JP', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });

        var subtotal_string = subtotal.toLocaleString('ja-JP', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });

        var quantity;

        if (finalist.state === 'UNORDERED') {
            quantity = (
                <TableFrame.Input
                  key={Math.random()}
                  type='int'
                  placeholder={finalist.quantity.toLocaleString()}
                  ref={'quantity' + index.toString()}
                  onChange={this.onChangeQuantity(index)} />
            );
        } else {
            quantity = finalist.quantity;
        }

        return [
            {
                value: finalist.name,
                view:  <FinalistName index={index}
                                     state={finalist.state}>
                         {finalist.name}
                       </FinalistName>
            },
            {
                value: finalist.maker,
                view:  <span>{finalist.maker}</span>
            },
            {
                value: finalist.price,
                view:  <span>{price_string}</span>
            },
            {
                value: finalist.quantity,
                view:  quantity
            },
            {
                value: subtotal,
                view:  <span>{subtotal_string}</span>
            },
            {
                value: finalist.state,
                view: <span>{state}</span>
            }
        ];
    },


    /*
     * 別 component にすると prop の数が大変になって、
     * 書くのも見るのも苦痛なのでメソッドで妥協。
     */
    makeFinalPaneNotices: function() {
        return (
            <div id="final-pane-notices">
              <div>
                <Notice id="final-pane-code"
                        title="起案番号">
                  {this.props.orderCode === ''? '未確定': this.props.orderCode}
                </Notice>
                <Notice id="final-pane-drafting-date"
                        title="起案日">
                  {this.props.draftingDate}
                </Notice>
                <Notice id="final-pane-order-type"
                        title="発注区分">
                  {Util.toOrderTypeName(this.props.orderType)}
                </Notice>
              </div>
              <div>
                <Notice id="final-pane-drafter"
                        title='起案者'>
                  {this.props.drafter}
                </Notice>
                <Notice id="final-pane-trader"
                        title="発注先 販売元">
                  {this.props.trader.name}
                </Notice>
              </div>
              <div>
                <Input id="final-pane-remark"
                       type="text"
                       bsSize="small"
                       placeholder="備考・連絡"
                       value={this.props.orderRemark}
                       onChange={this.onChangeRemark} />
              </div>
            </div>
        );
    },

    render: function() {
        var total = 0;
        var title = this.makeTableFrameTitle();
        var data  = this.props.finalists.map(function(f, i) {
            total += f.price * f.quantity;
            return this.makeTableFrameDataRow(f, i);
        }.bind(this) );


        /*
         * 発注一覧から飛んで来た場合、発注一覧へ返れるようにする。
         */
        var go_back_button = null;

        if (this.props.goBack != undefined) {
            go_back_button = (
                <Button bsSize="large"
                        bsStyle="primary"
                        className="final-pane-button"
                        onClick={this.props.goBack}>
                  戻る
                </Button>
            );
        }

        return (
            <fieldset id="final-pane" className="edit-order-pane">
              <legend>確定</legend>
              {this.makeFinalPaneNotices()}
              <TableFrame id="final-pane-finalists"
                          title={title}
                          data={data} />
              <div id="final-pane-total">
                <Notice title="発注総計">
                  {Math.round(total).toLocaleString()}
                </Notice>
              </div>
              <div id="final-pane-buttons">
                {go_back_button}
                <Button bsSize="large"
                        bsStyle="primary"
                        className="final-pane-button"
                        onClick={this.onClear}>
                  クリア
                </Button>
                <ButtonForNextAction onFix={this.onFix}
                                     onPrint={this.onPrint}
                                     needSave={this.props.needSave}
                                     orderId={this.props.orderId}   // 不要
                                     orderCode={this.props.orderCode}
                                     orderVersion={this.props.orderVersion}
                                     trader={this.props.trader}
                                     goBack={this.props.goBack} />
              </div>
            </fieldset>
        );
    }
});

module.exports = FinalPane;
