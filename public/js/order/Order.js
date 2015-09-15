/*
 * 通常 / 緊急 / 薬剤発注用。
 * 以下の 3 つのペインで構成される。
 *
 *   0. 検索ペイン: SearchPane
 *   1. 候補ペイン: CandidatePane
 *   2. 確定ペイン: FinalPane
 *
 * 操作の大まかな流れは、
 *
 *   0. 検索ペインで、発注する物品候補を絞るための検索条件を指定
 *   1. 絞られた物品候補を候補ペインに表示
 *   2. 候補ペインで実際に発注する物品を選択
 *   3. 選択された物品が、確定ペインへ
 *   4. 確定ペインで数量を指定
 *
 * できるだけ複雑さを排除するために、本実装では Flux (Fluxxor) を導入する。
 */
'use strict';
var React         = require('react');
var Fluxxor       = require('fluxxor');
var XHR           = require('superagent');
var SearchPane    = require('./SearchPane');
var CandidatePane = require('./CandidatePane');
var FinalPane     = require('./FinalPane');
var Messages      = require('../lib/Messages');

var messages = {
    SET_DEPARTMENT_CODE: 'SET_DEPARTMENT_CODE',
    UPDATE_CANDIDATES:   'UPDATE_CANDIDATES',
    ADD_FINALIST:        'ADD_FINALIST',
    CLEAR_FINALISTS:     'CLEAR_FINALISTS',
    CHANGE_QUANTITY:     'CHANGE_QUANTITY',
    REGISTER_ORDER:      'REGISTER_ORDER',
    UPDATE_ORDER:        'UPDATE_ORDER'
};

var OrderStore = Fluxxor.createStore({
    initialize: function() {
        this.department_code = '';      // 発注元となる部門診療科
        this.candidates      = [];      // 商品の発注候補一覧
        this.trader          = null;    // 発注先である販売元
        this.finalists       = [];      // 発注が確定した商品の一覧

        this.bindActions(
            messages.SET_DEPARTMENT_CODE,
            this.setDepartmentCode
        );
        this.bindActions(
            messages.UPDATE_CANDIDATES,
            this.onSearchCandidates
        );
        this.bindActions(
            messages.ADD_FINALIST,
            this.onSelectCandidate
        );
        this.bindActions(
            messages.CLEAR_FINALISTS,
            this.onClearFinalists
        );
        this.bindActions(
            messages.CHANGE_QUANTITY,
            this.onChangeQuantity
        );
    },


    /*
     * 発注先 部門診療科を変更したら、発注候補をクリアする。
     * そうでないと、発注候補にその部門診療科では扱えない商品が表示された
     * ままになる可能性があり、それが発注確定になる可能性がある。
     * つまり、本来発注できない商品を発注確定できてしまう。
     */
    setDepartmentCode: function(payload) {
        this.department_code = payload.code;
        this.candidates      = [];
        this.emit('change');
    },

    onSearchCandidates: function(payload) {
        this.candidates = payload;
        this.emit('change');
    },


    /*
     * 候補の中から発注する商品を選んだら (CandidatePane の CandidateName 参照)
     */
    onSelectCandidate: function(payload) {
        this.finalists.push({
            code:     '',
            goods:    payload.candidate.goods,
            maker:    payload.candidate.maker,
            price:    payload.candidate.price,
            quantity: 0,
            state:    'PROCESSING'
        });

        if (this.trader == null) {
            this.trader = payload.candidate.trader;


            /*
             * 販売元が確定したら、候補一覧から当該販売元以外を除く。
             * 以後は、当該販売元が必ず検索条件に指定されるため、
             * この操作は必要なくなる。
             */
            this.candidates = this.candidates.filter(function(c) {
                return c.trader.code === payload.candidate.trader.code;
            });
        }

        this.emit('change');
    },


    /*
     * 確定した商品をクリアする場合、状態が処理中のもの *だけ* 除去する。
     * 以下の状態のものは除去しちゃいけない。
     *
     *   - 発注済み
     *   - キャンセル
     *   - 納品済み
     */
    onClearFinalists: function() {
        this.finalists = this.finalists.filter(function(finalist) {
            return finalist.state !== 'PROCESSING';
        });

        if (this.finalists.length == 0) {
            this.trader = null;
        }

        this.emit('change');
    },


    /*
     * 確定した商品の発注数量を変更したら 
     */
    onChangeQuantity: function(payload) {
        this.finalists[payload.index].quantity = payload.value;
        this.emit('change');
    },


    /*
     * 既存の発注を state に設定
     */
    setExistingOrder: function(order) {
        /*
         * 発注確定商品一覧の数量は変更される可能性があるため、
         *
         *   this.finalists = order.finalists;
         *
         * と書いてはいけないことに注意。
         * これは、引数で渡される order が props === 変更不可であるため。
         * そのため、ここで逐一内容をコピーする必要がある。
         */
        this.finalists = order.finalists.map(function(f) {
            return {
                code:     f.code,
                goods:    f.goods,
                maker:    f.maker,
                price:    f.price,
                quantity: f.quantity,
                state:    f.state
            };
        });

        this.trader = order.trader;
        this.emit('change');
    },

    resetState: function() {
        this.candidates      = [];
        this.department_code = '';
        this.trader          = null;
        this.finalists       = [];
        this.emit('change');
    },

    getState: function() {
        return {
            candidates:      this.candidates,
            department_code: this.department_code,
            trader:          this.trader,
            finalists:       this.finalists,
        }
    }
});

var actions = {
    setDepartmentCode: function(payload) {
        this.dispatch(messages.SET_DEPARTMENT_CODE, payload);
    },

    updateCandidates: function(payload) {
        XHR.post('searchCandidates').send(payload).end(function(err, res) {
            if (err) {
                alert(Messages.ORDER_SEARCH_CANDIDATES);
                throw 'searchCandidates';
            }

            this.dispatch(messages.UPDATE_CANDIDATES, res.body);
        }.bind(this) );
    },

    addFinalist: function(payload) {
        this.dispatch(messages.ADD_FINALIST, payload);
    },

    clearFinalists: function() {
        this.dispatch(messages.CLEAR_FINALISTS);
    },

    changeQuantity: function(payload) {
        this.dispatch(messages.CHANGE_QUANTITY, payload);
    },
};

var OrderManager = React.createClass({
    mixins: [
        Fluxxor.FluxMixin(React),
        Fluxxor.StoreWatchMixin('OrderStore')
    ],

    propTypes: {
        flux:   React.PropTypes.object.isRequired,
        action: React.PropTypes.string.isRequired,
        user:   React.PropTypes.object.isRequired,
        order:  React.PropTypes.object
    },

    getStateFromFlux: function() {
        return this.getFlux().store('OrderStore').getState();
    },

    componentWillMount: function() {
        var store = this.getFlux().store('OrderStore');

        if (this.props.order !== null) {
            store.setExistingOrder(this.props.order);
        }
    },

    componentWillUnmount: function() {
        this.getFlux().store('OrderStore').resetState();
    },

    render: function() {
        var order_type;
        
        if (this.props.order != null) {
            order_type = this.props.order.type;
        } else {
            order_type = this.props.action;
        }

        return (
            <div id="ope">
              <div id="order-left-side">
                <SearchPane order_type={order_type}  
                            department_code={this.state.department_code}
                            final_trader={this.state.trader} />
                <CandidatePane key={Math.random()}
                               candidates={this.state.candidates} />
              </div>
              <div id="order-right-side">
                <FinalPane key={Math.random()} 
                           action={this.props.action}
                           account={this.props.user.account}
                           finalists={this.state.finalists}
                           department_code={this.state.department_code}
                           trader={this.state.trader}
                           order={this.props.order} />
              </div>
            </div>
        );
    }
});


/*
 * Fluxxor を利用する上でのお約束
 */
var stores = { OrderStore: new OrderStore() };
var flux   = new Fluxxor.Flux(stores, actions);


/*
 * Fluxxor を利用する都合上設けた、ダミーの最上位コンポーネント。
 */
var Order = React.createClass({
    propTypes: {
        user: React.PropTypes.object.isRequired,

        action: React.PropTypes.oneOf([
            'ORDINARY_ORDER',
            'URGENCY_ORDER',
            'MEDS_ORDER'
        ]),

        order: React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,

            type: React.PropTypes.oneOf([
                'ORDINARY_ORDER',
                'URGENCY_ORDER',
                'MEDS_ORDER'
            ]),

            drafting_date:  React.PropTypes.string.isRequired,
            last_edit_date: React.PropTypes.string.isRequired,

            originator: React.PropTypes.shape({
                code: React.PropTypes.string.isRequired,
                name: React.PropTypes.string.isRequired,
            }).isRequired,

            last_editor: React.PropTypes.shape({
                code: React.PropTypes.string.isRequired,
                name: React.PropTypes.string.isRequired,
            }).isRequired,

            trader: React.PropTypes.shape({
                code: React.PropTypes.string.isRequired,
                name: React.PropTypes.string.isRequired
            }),

            finalists: React.PropTypes.arrayOf(React.PropTypes.shape({
                code: React.PropTypes.string.isRequired,

                goods: React.PropTypes.shape({
                    code: React.PropTypes.string.isRequired,
                    name: React.PropTypes.string.isRequired
                }).isRequired,

                maker:    React.PropTypes.string.isRequired,
                price:    React.PropTypes.number.isRequired,
                quantity: React.PropTypes.number.isRequired,

                state: React.PropTypes.oneOf([
                    'PROCESSING',   // 処理中
                    'ORDERED',      // 発注済み
                    'CANCELED',     // キャンセル
                    'DELIVERED'     // 納品済み
                ]).isRequired,

                last_change_date: React.PropTypes.string.isRequired
            }) ).isRequired,

            state: React.PropTypes.oneOf([
                'REQUESTING',       // 依頼中
                'APPROVING',        // 承認待ち
                'DENIED',           // 否認
                'APPROVED',         // 承認済み
                'NULLIFIED',        // 無効
                'COMPLETED'         // 完了
            ]).isRequired,

            last_modified_date: React.PropTypes.string.isRequired,

            last_modifier: React.PropTypes.shape({
                code: React.PropTypes.string.isRequired,
                name: React.PropTypes.string.isRequired
            }).isRequired
        })
    },

    getDefaultProps: function() {
        return {
            order: null
        };
    },

    render: function() {
        return <OrderManager flux={flux}
                             user={this.props.user}
                             action={this.props.action}
                             order={this.props.order} />;
    }
});

module.exports = Order;
