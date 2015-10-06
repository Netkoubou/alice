/*
 * 確定ペイン
 */
'use strict';
var React      = require('react');
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
            'PROCESSING',
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
         * 削除できるのは処理中の物品のみ
         */
        if (this.props.state === 'PROCESSING') {
            return (
                <div className='order-finalist-name'
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
        onFix:     React.PropTypes.func.isRequired,
        onPrint:   React.PropTypes.func.isRequired,
        needSave:  React.PropTypes.bool.isRequired,
        orderCode: React.PropTypes.string.isRequired,
        trader:    React.PropTypes.object.isRequired
    },

    eraseOrder: function() {
        if (confirm("この発注を消去します。よろしいですか?") ) {
            XHR.post('eraseOrder').send({
                order_code: this.props.orderCode
            }).end(function(err, res) {
                if (err) {
                    alert(Messages.ajax.FINAL_PANE_ERASE_ORDER);
                    throw 'ajax_eraseOrder';
                }

                if (res.body.status != 0) {
                    alert(Messages.server.FINAL_PANE_ERASE_ORDER);
                    throw 'server_eraseOrder';
                }

                alert('消去しました');
                this.getFlux().actions.resetOrder();
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
                <Button bsSize="small" onClick={this.eraseOrder}>
                  消去
                </Button>
             );
        } else if (this.props.needSave) {
            return (
                <Button bsSize="small"
                        onClick={this.props.onFix}
                        disabled={this.props.trader.code === ''}>
                  確定
                </Button>
            );
        }

        return (
            <Button bsSize="small" onClick={this.props.onPrint}>
              印刷
            </Button>
        );
    }
});

var FinalPane = React.createClass({
    mixins: [ Fluxxor.FluxMixin(React) ],

    propTypes: {
        departmentCode: React.PropTypes.string.isRequired,
        orderCode:      React.PropTypes.string.isRequired,
        orderRemark:    React.PropTypes.string.isRequired,
        draftingDate:   React.PropTypes.string.isRequired,
        orderType:      React.PropTypes.string.isRequired,
        drafter:        React.PropTypes.string.isRequired,

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
                'PROCESSING',
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


    /*
     * 確定ボタンがクリックされたら
     */
    onFix: function() {
        if (this.props.orderCode === '') {
            /*
             * 発注を新規登録
             */
            XHR.post('registerOrder').send({
                order_type:      this.props.orderType,
                order_remark:    this.props.orderRemark,
                department_code: this.props.departmentCode,
                trader_code:     this.props.trader.code,
                products:        this.props.finalists.map(function(f) {
                    return {
                        code:     f.code,
                        quantity: f.quantity
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

                alert('登録しました');
                this.getFlux().actions.setOrderCode({
                    code: res.body.order_code
                });
            }.bind(this) );
        } else {
            /*
             * 登録済みの若しくは既存の発注を更新
             */
            XHR.post('updateOrder').send({
                order_code:      this.props.orderCode,
                order_remark:    this.props.orderRemark,
                department_code: this.props.departmentCode,
                trader_code:     this.props.trader.code,
                products:        this.props.finalists.map(function(f) {
                    return{
                        code:     f.code,
                        quantity: f.quantity
                    };
                })
            }).end(function(err, res) {
                if (err) {
                    alert(Messages.ajax.FINAL_PANE_UPDATE_ORDER);
                    throw 'ajax_updateOrder';
                }

                if (res.body.status != 0) {
                    alert(Messages.server.FINAL_PANE_UPDATE_ORDER);
                    throw 'server_registerOrder';
                }

                alert('更新しました');
                this.getFlux().actions.fixFinalists();
            }.bind(this) );
        }
    },


    /*
     * 印刷ボタンがクリックされたら
     */
    onPrint: function() {
        XHR.post('changeOrderState').send({
            order_code:   this.props.orderCode,
            order_state:  'APPROVING',
            order_remark: this.props.orderRemark
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.FINAL_PANE_CHANGE_ORDER_STATE);
                throw 'ajax_changeOrderState';
            }

            if (res.body.status != 0) {
                alert(Messages.server.FINAL_PANE_CHANGE_ORDER_STATE);
                throw 'server_changeOrderState';
            }

            alert('承認待ちになりました');

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
        return function(e) {
            var value = 0;
            
            if (e.target.value.match(/^[\d,]+$/) ) {
                value = parseInt(e.target.value.replace(',', '') );
            }

            return this.getFlux().actions.changeQuantity({
                index: index,
                value: value
            });
        }.bind(this);
    },

    onChangeRemark: function(e) {
        return this.getFlux().actions.setOrderRemark({
            remark: e.target.value
        });
    },

    render: function() {
        var order_code = this.props.orderCode;

        if (order_code === '') {
            order_code = '未確定';
        }

        var title = [
            { name: '品名',     type: 'string' },
            { name: '製造元',   type: 'string' },
            { name: '現在単価', type: 'number' },
            { name: '数量',     type: 'number' },
            { name: '発注小計', type: 'number' },
            { name: '状態',     type: 'string' }
        ];

        var total = 0;
        var data  = this.props.finalists.map(function(finalist, i) {
            var state    = Util.toProductStateName(finalist.state);
            var subtotal = finalist.price * finalist.quantity;

            total += subtotal;

            var price_string = finalist.price.toLocaleString('ja-JP', {
                minimumFractionDigits: 2
            });

            var subtotal_string = subtotal.toLocaleString('ja-JP', {
                minimumFractionDigits: 2
            });

            return [
                {
                    value: finalist.name,
                    view:  <FinalistName index={i}
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
                    view:  <TableFrame.Input
                             key={Math.random()}
                             type='int'
                             placeholder={finalist.quantity.toLocaleString()}
                             onChange={this.onChangeQuantity(i)} />
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
        }.bind(this) );

        return (
            <fieldset id="order-final-pane" className="order-pane">
              <legend>確定</legend>
              <div id="order-final-pane-notice">
                <div>
                  <Notice className="order-final-pane-code"
                          title="起案番号">
                    {order_code}
                  </Notice>
                  <Notice className="order-final-pane-drafting-date"
                          title="起案日">
                    {this.props.draftingDate}
                  </Notice>
                  <Notice className="order-final-pane-order-type"
                          title="発注区分">
                    {Util.toOrderTypeName(this.props.orderType)}
                  </Notice>
                </div>
                <div>
                  <Notice className="order-final-pane-drafter"
                          title='起案者'>
                    {this.props.drafter}
                  </Notice>
                  <Notice className="order-final-pane-trader"
                          title="発注先 販売元">
                    {this.props.trader.name}
                  </Notice>
                </div>
                <div>
                  <Input id="order-final-pane-remark"
                         type="text"
                         bsSize="small"
                         placeholder="備考・連絡"
                         value={this.props.orderRemark}
                         onChange={this.onChangeRemark} />
                </div>
              </div>
              <TableFrame id="order-finalists" title={title} data={data} />
              <div id="order-finalist-total">
                <Notice title="発注総計">
                  {Math.round(total).toLocaleString()}
                </Notice>
              </div>
              <div id="order-final-pane-buttons">
                <Button bsSize="small" onClick={this.onClear}>
                  クリア
                </Button>
                <ButtonForNextAction onFix={this.onFix}
                                     onPrint={this.onPrint}
                                     needSave={this.props.needSave}
                                     orderCode={this.props.orderCode}
                                     trader={this.props.trader} />
              </div>
            </fieldset>
        );
    }
});

module.exports = FinalPane;
