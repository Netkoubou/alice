/*
 * 確定ペイン
 */
'use strict';
var React      = require('react');
var Button     = require('react-bootstrap').Button;
var Fluxxor    = require('fluxxor');
var Notice     = require('../components/Notice');
var TableFrame = require('../components/TableFrame');
var Input      = TableFrame.Input;

var FinalPane = React.createClass({
    mixins: [ Fluxxor.FluxMixin(React) ],

    propTypes: {
        user:      React.PropTypes.object,
        finalists: React.PropTypes.arrayOf(React.PropTypes.shape({
            goods: React.PropTypes.shape({
                code: React.PropTypes.string.isRequired,
                name: React.PropTypes.string.isRequired
            }).isRequired,
            
            maker: React.PropTypes.shape({
                code: React.PropTypes.string.isRequired,
                name: React.PropTypes.string.isRequired
            }).isRequired,
            
            price:    React.PropTypes.number,
            quantity: React.PropTypes.number,
            state:    React.PropTypes.oneOf([
                'PROCESSING',
                'ORDERED',
                'CANCELED',
                'DELIVERED'
            ]).isRequired
        }) ).isRequired,

        final_trader: React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        }),

        order: React.PropTypes.object
    },


    /*
     * クリアボタンがクリックされたら
     */
    onClear: function() {
        return this.getFlux().actions.clearFinalists();
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
            var value = e.target.value.match(/^\d+$/)? e.target.value: '0';

            return this.getFlux().actions.changeQuantity({
                index: index,
                value: parseInt(value)
            });
        }.bind(this);
    },

    render: function() {
        var order_code, originator, drafting_date;

        if (this.props.order == undefined) {
            order_code = '未登録';
            originator = this.props.user.account;

            var now   = new Date();
            var year  = now.getFullYear().toString();
            var month = (now.getMonth() + 1).toString();
            var day   = now.getDate().toString();

            drafting_date = year + '-' + month + '-' + day;
        } else {
            order_code    = this.props.order.code;
            originator    = this.props.order.originator;
            drafging_date = this.props.order.drafting_date;
        }

        var trader = {};

        if (this.props.final_trader == undefined) {
            trader = { code: null, name: '未確定' };
        } else {
            trader = this.props.final_trader;
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

        var data = this.props.finalists.map(function(finalist, i) {
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

            return [
                {
                    value: finalist.goods.name,
                    view:  <span>{finalist.goods.name}</span>
                },
                {
                    value: finalist.maker.name,
                    view:  <span>{finalist.maker.name}</span>
                },
                {
                    value: finalist.price,
                    view:  <span>{finalist.price.toLocaleString()}</span>
                },
                {
                    value: finalist.quantity,
                    view:  <Input type='int'
                                  placeholder={finalist.quantity.toString()}
                                  onChange={this.onChangeQuantity(i)} />
                },
                {
                    value: subtotal,
                    view:  <span>{subtotal.toLocaleString()}</span>
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
                          title='販売元'>
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
                <Button bsSize="small">
                  確定
                </Button>
              </div>
            </fieldset>
        );
    }
});

module.exports = FinalPane;
