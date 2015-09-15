/*
 * 確定ペイン
 */
'use strict';
var React      = require('react');
var Button     = require('react-bootstrap').Button;
var Fluxxor    = require('fluxxor');
var XHR        = require('superagent');
var Notice     = require('../components/Notice');
var TableFrame = require('../components/TableFrame');
var Input      = TableFrame.Input;
var Messages   = require('../lib/Messages');

var FinalPane = React.createClass({
    mixins: [ Fluxxor.FluxMixin(React) ],

    propTypes: {
        action:    React.PropTypes.string.isRequired,
        account:   React.PropTypes.string.isRequired,
        finalists: React.PropTypes.arrayOf(React.PropTypes.shape({
            code:  React.PropTypes.string.isRequired,
            goods: React.PropTypes.shape({
                code: React.PropTypes.string.isRequired,
                name: React.PropTypes.string.isRequired
            }).isRequired,
            
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

        department_code: React.PropTypes.string,

        trader: React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        }),

        order: React.PropTypes.object
    },

    getDefaultProps: function() {
        return {
            department_code: '',
            trader:          null,
            order:           null
        };
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
        if (this.props.order === null) {
            XHR.post('registerOrger').send({
                type:            this.props.action,
                department_code: this.props.department_code,
                trader_code:     this.props.trader.code,
                finalists:       this.props.finalists.map(function(f) {
                                     return {
                                         code:     f.goods.code,
                                         quantity: f.quantity
                                     };
                                 })
            }).end(function(err, res) {
                if (err) {
                    alert(Messages.FINAL_PANE_REGISTER_ORDER);
                    throw 'registerOrder';
                }

                if (res.body.status != 0) {
                    alert(res.body.description);
                } else {
                    alert('登録しました');
                    window.location.replace('index.html');
                }
            });
        }
    },


    /*
     * 発注が確定した商品の数量が変更されたら呼び出されるコールバック関数を
     * 返す関数。
     * コールバック関数そのものではないので注意。
     * クロージャで、発注が確定した商品が格納される配列のインデックス == index
     * を保持して、当該商品の数量を変更できるようにしている。
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

    render: function() {
        var originator, order_code, drafting_date;

        if (this.props.order == null) {
            originator = this.props.account;
            order_code = '未登録';

            var now   = new Date();
            var year  = now.getFullYear().toString();
            var month = (now.getMonth() + 1).toString();
            var day   = now.getDate().toString();

            drafting_date = year + '-' + month + '-' + day;
        } else {
            originator    = this.props.order.originator;
            order_code    = this.props.order.code;
            drafting_date = this.props.order.drafting_date;
        }

        var trader = {};

        if (this.props.trader == null) {
            trader = { code: null, name: '未確定' };
        } else {
            trader = this.props.trader;
        }

        var title = [
            { name: '品名',   type: 'string' },
            { name: '製造者', type: 'string' },
            { name: '単価',   type: 'number' },
            { name: '数量',   type: 'number' },
            { name: '小計',   type: 'number' },
            { name: '状態',   type: 'string' }
        ];

        var total = 0;
        var data  = this.props.finalists.map(function(finalist, i) {
            var subtotal = finalist.price * finalist.quantity;

            total += subtotal;

            var state;

            switch (finalist.state) {
            case 'PROCESSING':
                state = '処理中';
                break;
            case 'ORDERED':
                state = '発注済み';
                break;
            case 'CANCELED':
                state = 'キャンセル';
                break;
            default:
                state = '納品済み';
            }

            var price_string = finalist.price.toLocaleString('ja-JP', {
                minimumFractionDigits: 2
            });

            var subtotal_string = subtotal.toLocaleString('ja-JP', {
                minimumFractionDigits: 2
            });

            return [
                {
                    value: finalist.goods.name,
                    view:  <span>{finalist.goods.name}</span>
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
                    view:  <Input type='int'
                                  placeholder={finalist.quantity.toString()}
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
                  <Notice className="order-final-pane-notice-left"
                          title='起案番号'>
                    {order_code}
                  </Notice>
                  <Notice className="order-final-pane-notice-right"
                          title='起案日'>
                    {drafting_date}
                  </Notice>
                </div>
                <div>
                  <Notice className="order-final-pane-notice-left"
                          title='起案者'>
                    {originator}
                  </Notice>
                  <Notice className="order-final-pane-notice-right"
                          title='発注先 販売元'>
                    {trader.name}
                  </Notice>
                </div>
              </div>
              <TableFrame id="order-finalists" title={title} data={data} />
              <div id="order-total">
                <Notice title="総計">
                  {total.toLocaleString()}
                </Notice>
              </div>
              <div id="order-final-pane-buttons">
                <Button bsSize="small">
                  印刷
                </Button>
                <Button bsSize="small" onClick={this.onClear}>
                  クリア
                </Button>
                <Button bsSize="small" onClick={this.onFix}>
                  確定
                </Button>
              </div>
            </fieldset>
        );
    }
});

module.exports = FinalPane;
