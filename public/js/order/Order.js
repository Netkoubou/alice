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


/*
 * Flux 定数
 */
var messages = {
    SET_DEPARTMENT_CODE: 'SET_DEPARTMENT_CODE',
    UPDATE_CANDIDATES:   'UPDATE_CANDIDATES',
    ADD_FINALIST:        'ADD_FINALIST',
    REMOVE_FINALIST:     'REMOVE_FINALIST',
    CLEAR_FINALISTS:     'CLEAR_FINALISTS',
    CHANGE_QUANTITY:     'CHANGE_QUANTITY',
    FIX_FINALISTS:       'FIX_FINALISTS'
};


/*
 * Flux Store
 */
var OrderStore = Fluxxor.createStore({
    initialize: function() {
        this.department_code = '';      // 発注元 部門診療科の ID
        this.trader          = null;    // 発注先 販売元の ID と名前
        this.candidates      = [];      // 物品の発注候補一覧
        this.finalists       = [];      // 物品の発注確定一覧
        this.need_save       = true;    // 発注確定一覧を DB に登録必要か?

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
            messages.REMOVE_FINALIST,
            this.onSelectFinalist
        );
        this.bindActions(
            messages.CLEAR_FINALISTS,
            this.onClearFinalists
        );
        this.bindActions(
            messages.CHANGE_QUANTITY,
            this.onChangeQuantity
        );
        this.bindActions(
            messages.FIX_FINALISTS,
            this.onFixFinalists
        );
    },


    /*
     * 発注先 部門診療科を変更したら、発注候補一覧をクリアする。
     * そうでないと、発注候補にその部門診療科では扱えない物品が表示された
     * ままになる可能性がある、即ち本来発注できない物品が発注確定一覧に入
     * る可能性がある。
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
     *  発注候補一覧の中から物品を選択すると、それが発注確定一覧に入る。
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
             * 販売元が確定したら、発注候補一覧から当該販売元以外を除く。
             * 以後は、当該販売元が必ず検索条件に指定されるため、
             * この操作は必要なくなる。
             */
            this.candidates = this.candidates.filter(function(c) {
                return c.trader.code === payload.candidate.trader.code;
            });
        }

        this.need_save = true;  // 発注確定一覧が更新された
        this.emit('change');
    },


    /*
     * 発注確定一覧から物品を選んだら、発注確定一覧から削除する。
     */
    onSelectFinalist: function(payload) {
        this.finalists.splice(payload.index, 1);

        if (this.finalists.length == 0) {
            this.trader = null;
        }

        this.need_save = true;  // 発注確定一覧が更新された
        this.emit('change');
    },


    /*
     * 発注確定一覧をクリアする場合、状態が処理中のもの *だけ* 除去する。
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

        this.need_save = true;    // 発注確定一覧が更新された
        this.emit('change');
    },


    /*
     * 発注確定一覧の物品の数量を変更したら 
     */
    onChangeQuantity: function(payload) {
        this.finalists[payload.index].quantity = payload.value;
        this.need_save = true;  // 発注確定一覧が更新された
        this.emit('change');
    },


    /*
     * 新規若しくは変更した既存の発注確定一覧を DB に登録したら
     */
    onFixFinalists: function() {
        this.need_save = false;
        this.emit('change');
    },


    /*
     * 既存の発注を state に設定
     */
    setExistingOrder: function(order) {
        /*
         * 発注確定一覧の数量は変更される可能性があるため、
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

        this.trader     = order.trader;
        this.need_save = false;     // 既存の発注 === 最新版 === 未更新
        this.emit('change');
    },

    resetState: function() {
        this.candidates      = [];
        this.department_code = '';
        this.trader          = null;
        this.finalists       = [];
        this.need_save       = true;
        this.emit('change');
    },

    getState: function() {
        return {
            candidates:      this.candidates,
            department_code: this.department_code,
            trader:          this.trader,
            finalists:       this.finalists,
            need_save:       this.need_save
        }
    }
});


/*
 * Flux Action
 */
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

    removeFinalist: function(payload) {
        this.dispatch(messages.REMOVE_FINALIST, payload);
    },

    clearFinalists: function() {
        this.dispatch(messages.CLEAR_FINALISTS);
    },

    changeQuantity: function(payload) {
        this.dispatch(messages.CHANGE_QUANTITY, payload);
    },

    fixFinalists: function() {
        this.dispatch(messages.FIX_FINALISTS);
    }
};


/*
 * これが本モジュールにおける事実上の main
 */
var OrderManager = React.createClass({
    mixins: [
        Fluxxor.FluxMixin(React),
        Fluxxor.StoreWatchMixin('OrderStore')
    ],

    propTypes: {
        flux:    React.PropTypes.object.isRequired,
        account: React.PropTypes.string.isRequired,
        action:  React.PropTypes.string.isRequired,
        order:   React.PropTypes.object
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
                <SearchPane orderType={order_type}  
                            departmentCode={this.state.department_code}
                            finalTrader={this.state.trader} />
                <CandidatePane key={Math.random()}
                               candidates={this.state.candidates} />
              </div>
              <div id="order-right-side">
                <FinalPane key={Math.random()} 
                           action={this.props.action}
                           account={this.props.account}
                           needSave={this.state.need_save}
                           finalists={this.state.finalists}
                           departmentCode={this.state.department_code}
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
        account: React.PropTypes.string.isRequired,

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
        return { order: null };
    },

    render: function() {
        return <OrderManager flux={flux}
                             account={this.props.account}
                             action={this.props.action}
                             order={this.props.order} />;
    }
});

module.exports = Order;
