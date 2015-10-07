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
var SearchPane    = require('./edit-order/SearchPane');
var CandidatePane = require('./edit-order/CandidatePane');
var FinalPane     = require('./edit-order/FinalPane');
var Messages      = require('../lib/Messages');
var Util          = require('../lib/Util');


/*
 * Flux 定数
 */
var messages = {
    SET_ORDER_CODE:      'SET_ORDER_CODE',
    SET_ORDER_REMARK:    'SET_ORDER_REMARK',
    SET_DEPARTMENT_CODE: 'SET_DEPARTMENT_CODE',
    UPDATE_CANDIDATES:   'UPDATE_CANDIDATES',
    ADD_FINALIST:        'ADD_FINALIST',
    REMOVE_FINALIST:     'REMOVE_FINALIST',
    CLEAR_FINALISTS:     'CLEAR_FINALISTS',
    CHANGE_QUANTITY:     'CHANGE_QUANTITY',
    FIX_FINALISTS:       'FIX_FINALISTS',
    RESET_ORDER:         'RESET_ORDER'
};


/*
 * Flux Store
 */
var StoreForEditOrder = Fluxxor.createStore({
    initialize: function() {
        this.department_code = '';          // 発注元 部門診療科のコード
        this.order_code      = '';          // 起案番号
        this.order_remark    = '';          // 備考
        this.trader        = { code: '', name: '未確定'};   // 発注先 販売元
        this.candidates      = [];          // 物品の発注候補一覧
        this.finalists       = [];          // 物品の発注確定一覧
        this.need_save       = true;        // 発注確定一覧を DB に登録必要か?

        this.bindActions(
            messages.SET_ORDER_CODE,
            this.setOrderCode
        );
        this.bindActions(
            messages.SET_ORDER_REMARK,
            this.setOrderRemark
        );
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
        this.bindActions(
            messages.RESET_ORDER,
            this.resetState
        );
    },


    /*
     * 新規発注の DB 登録時に確定した起案番号を記録する。
     * これが呼び出されるということは即ち、
     * 最新の発注が DB に登録済みである、ということである。
     * と言うことで、need_save フラグを false にしている。
     */
    setOrderCode: function(payload) {
        this.order_code = payload.code;
        this.need_save  = false;
        this.emit('change');
    },

    setOrderRemark: function(payload) {
        this.order_remark = payload.remark;
        this.need_save    = true;   // 備考が更新された
        this.emit('change');
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
            code:     payload.candidate.product_code,
            name:     payload.candidate.product_name,
            maker:    payload.candidate.maker,
            price:    payload.candidate.cur_price,
            quantity: 0,
            state:    'PROCESSING'
        });

        if (this.trader.code === '') {
            this.trader = {
                code: payload.candidate.trader_code,
                name: payload.candidate.trader_name
            }


            /*
             * 販売元が確定したら、発注候補一覧から当該販売元以外を除く。
             * 以後は、当該販売元が必ず検索条件に指定されるため、
             * この操作は必要なくなる。
             */
            this.candidates = this.candidates.filter(function(c) {
                return c.trader_code === payload.candidate.trader_code;
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
            this.trader = { code: '', name: '未確定' };
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
            this.trader = { code: '', name: '未確定' };
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
        this.department_code = order.department_code;
        this.order_code      = order.order_code;
        this.order_remark    = order.order_remark;
        this.drafting_date   = order.drafting_date;


        /*
         * 発注確定一覧の数量は変更される可能性があるため、
         *
         *   this.finalists = order.finalists;
         *
         * と書いてはいけないことに注意。
         * これは、引数で渡される order が props === 変更不可であるため。
         * そのため、ここで逐一内容をコピーする必要がある。
         */
        this.finalists = order.products.map(function(p) {
            return {
                code:     p.code,
                name:     p.name,
                maker:    p.maker,
                price:    p.cur_price,
                quantity: p.quantity,
                state:    p.state
            };
        });

        this.trader = {
            code: order.trader_code,
            name: order.trader_name
        };

        this.need_save = false;     // 既存の発注 === 最新版 === 未更新
        this.emit('change');
    },

    resetState: function() {
        this.order_code      = '';
        this.order_remark    = '';
        this.candidates      = [];
        this.trader          = { code: '', name: '未確定' };
        this.finalists       = [];
        this.need_save       = true;
        this.emit('change');
    },

    getState: function() {
        return {
            department_code: this.department_code,
            order_code:      this.order_code,
            order_remark:    this.order_remark,
            drafting_date:   this.drafting_date,
            candidates:      this.candidates,
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
    setOrderCode: function(payload) {
        this.dispatch(messages.SET_ORDER_CODE, payload);
    },

    setOrderRemark: function(payload) {
        this.dispatch(messages.SET_ORDER_REMARK, payload);
    },

    setDepartmentCode: function(payload) {
        this.dispatch(messages.SET_DEPARTMENT_CODE, payload);
    },

    updateCandidates: function(payload) {
        XHR.post('searchCandidates').send(payload).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.ORDER_SEARCH_CANDIDATES);
                throw 'ajax_searchCandidates';
            }

            if (res.body.status != 0) {
                alert(Messages.server.ORDER_SEARCH_CANDIDATES);
                throw 'server_searchCandidates';
            }

            this.dispatch(messages.UPDATE_CANDIDATES, res.body.candidates);
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
    },

    resetOrder: function() {
        this.dispatch(messages.RESET_ORDER);
    }
};


/*
 * これが本モジュールにおける事実上の main
 */
var SubeditOrder = React.createClass({
    mixins: [
        Fluxxor.FluxMixin(React),
        Fluxxor.StoreWatchMixin('StoreForEditOrder')
    ],

    propTypes: {
        flux:      React.PropTypes.object.isRequired,
        account:   React.PropTypes.string.isRequired,
        orderType: React.PropTypes.oneOf([
            'ORDINARY_ORDER',
            'URGENCY_ORDER',
            'MEDS_ORDER'
        ]).isRequired,
        order:  React.PropTypes.object,
        goBack: React.PropTypes.func
    },

    getStateFromFlux: function() {
        return this.getFlux().store('StoreForEditOrder').getState();
    },

    componentDidMount: function() {
        var store = this.getFlux().store('StoreForEditOrder');

        if (this.props.order !== null) {
            store.setExistingOrder(this.props.order);
        }
    },

    componentWillUnmount: function() {
        this.getFlux().store('StoreForEditOrder').resetState();
    },

    render: function() {
        var drafting_date = Util.toCanonicalizedDate(new Date() ); // 起案日
        var drafter       = this.props.account;

        if (this.props.order != null) {
            drafting_date = this.props.order.drafting_date;
            drafter       = this.props.order.drafter_account;
        }

        return (
            <div id="ope">
              <div id="order-edit-left-side">
                <SearchPane orderType={this.props.orderType}  
                            departmentCode={this.state.department_code}
                            finalTrader={this.state.trader} />
                <CandidatePane key={Math.random()}
                               candidates={this.state.candidates} />
              </div>
              <div id="order-edit-right-side">
                <FinalPane departmentCode={this.state.department_code}
                           orderCode={this.state.order_code}
                           orderRemark={this.state.order_remark}
                           draftingDate={drafting_date}
                           orderType={this.props.orderType}
                           drafter={drafter}
                           trader={this.state.trader}
                           finalists={this.state.finalists}
                           needSave={this.state.need_save}
                           goBack={this.props.goBack} />
              </div>
            </div>
        );
    }
});


/*
 * Fluxxor を利用する上でのお約束
 */
var stores = { StoreForEditOrder: new StoreForEditOrder() };
var flux   = new Fluxxor.Flux(stores, actions);


/*
 * Fluxxor を利用する都合上設けた、ダミーの最上位コンポーネント。
 */
var EditOrder = React.createClass({
    propTypes: {
        account: React.PropTypes.string.isRequired,

        action: React.PropTypes.oneOf([
            'DRAFT_ORDINARY_ORDER',
            'DRAFT_URGENCY_ORDER',
            'DRAFT_MEDS_ORDER'
        ]),

        order: React.PropTypes.shape({
            order_code:   React.PropTypes.string.isRequired,

            order_type: React.PropTypes.oneOf([
                'ORDINARY_ORDER',
                'URGENCY_ORDER',
                'MEDS_ORDER'
            ]),

            order_state: React.PropTypes.oneOf([
                'REQUESTING',       // 依頼中
                'APPROVING',        // 承認待ち
                'APPROVED',         // 承認済み
                'NULLIFIED',        // 無効
                'COMPLETED'         // 完了
            ]).isRequired,

            order_remark:    React.PropTypes.string.isRequired,
            drafting_date:   React.PropTypes.string.isRequired,
            drafter_code:    React.PropTypes.string.isRequired,
            drafter_account: React.PropTypes.string.isRequired,
            department_code: React.PropTypes.string.isRequired,
            department_name: React.PropTypes.string.isRequired,
            trader_code:     React.PropTypes.string.isRequired,
            trader_name:     React.PropTypes.string.isRequired,

            products: React.PropTypes.arrayOf(React.PropTypes.shape({
                code:      React.PropTypes.string.isRequired,
                name:      React.PropTypes.string.isRequired,
                maker:     React.PropTypes.string.isRequired,
                min_price: React.PropTypes.number.isRequired,
                cur_price: React.PropTypes.number.isRequired,
                max_price: React.PropTypes.number.isRequired,
                quantity:  React.PropTypes.number.isRequired,

                state: React.PropTypes.oneOf([
                    'PROCESSING',   // 処理中
                    'ORDERED',      // 発注済み
                    'CANCELED',     // キャンセル
                    'DELIVERED'     // 納品済み
                ]).isRequired,

                billing_amount:      React.PropTypes.number.isRequired,
                last_edited_date:    React.PropTypes.string.isRequired,
                last_editor_code:    React.PropTypes.string.isRequired,
                last_editor_account: React.PropTypes.string.isRequired,
            }) ).isRequired,

            last_modified_date:    React.PropTypes.string.isRequired,
            last_modifier_code:    React.PropTypes.string.isRequired,
            last_modifier_account: React.PropTypes.string.isRequired
        }),

        goBack: React.PropTypes.func
    },

    getDefaultProps: function() {
        return { order: null };
    },

    render: function() {
        var order_type;

        if (this.props.order != null) {
            order_type = this.props.order.order_type;
        } else {
            switch (this.props.action) {
            case 'DRAFT_ORDINARY_ORDER':
                order_type = 'ORDINARY_ORDER';
                break;
            case 'DRAFT_URGENCY_ORDER':
                order_type = 'URGENCY_ORDER';
                break;
            case 'DRAFT_MEDS_ORDER':
                order_type = 'MEDS_ORDER';
                break;
            default:
                alert(Messages.internal.UNEXPECTED_ACTION);
                throw 'internal_unexpectedAction';
            }
        }

        return <SubeditOrder flux={flux}
                             account={this.props.account}
                             orderType={order_type}
                             order={this.props.order}
                             goBack={this.props.goBack} />;
    }
});

module.exports = EditOrder;
