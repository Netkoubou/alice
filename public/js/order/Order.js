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

var messages = {
    UPDATE_CANDIDATES: 'UPDATE_CANDIDATES',
    ADD_FINALIST:      'ADD_FINALIST'
};

var OrderStore = Fluxxor.createStore({
    initialize: function() {
        this.candidates   = [];
        this.finalists    = [];
        this.final_trader = {};
        this.originator   = {};
        this.bindActions(messages.UPDATE_CANDIDATES, this.onSearchCandidates);
        this.bindActions(messages.ADD_FINALIST,      this.onSelectCandidate);
    },

    onSearchCandidates: function(payload) {
        XHR.post('pickCandidates').send({
            user:          payload.user,
            category_code: payload.category_code,
            trader_code:   payload.trader_code,
            search_text:   payload.search_text
        }).end(function(err, res) {
            if (err) {
                alert('ERROR! pickCandidates');
                throw 'pickCandidates';
            }

            this.candidates = res.body;
            this.emit('change');
        }.bind(this) );
    },

    onSelectCandidate: function(payload) {
        this.finalists.push(payload.finalist);
        this.emit('change');
    },

    setOriginator: function(user) {
        this.originator.code       = user.code;
        this.originator.name       = user.name;
        this.originator.department = user.department;

        // no emit
    },

    setExistingOrder: function(order) {
        this.finalists    = order.finalists;
        this.final_trader = order.trader;
        this.originator   = order.originator;
        this.emit('change');
    },

    getState: function() {
        return {
            candidates:   this.candidates,
            finalists:    this.finalists,
            final_trader: this.final_trader,
        }
    }
});

var actions = {
    updateCandidates: function(payload) {
        this.dispatch(messages.UPDATE_CANDIDATES, payload);
    },

    addFinalist: function(payload) {
        this.dispatch(messages.ADD_FINALIST, payload);
    }
};

var OrderManager = React.createClass({
    mixins: [
        Fluxxor.FluxMixin(React),
        Fluxxor.StoreWatchMixin('OrderStore')
    ],

    propTypes: {
        flux: React.PropTypes.object.isRequired,
        user: React.PropTypes.object.isRequired
    },

    getStateFromFlux: function() {
        return this.getFlux().store('OrderStore').getState();
    },

    componentWillMount: function() {
        var store = this.getFlux().store('OrderStore');

        if (this.props.order !== undefined) {
            store.setExistingOrder(this.props.order);
        } else {
            store.setOriginator(this.props.user);
        }
    },

    render: function() {
        return (
            <div id="ope">
              <div id="order-left-side">
                <SearchPane user={this.props.user} />
                <CandidatePane candidates={this.state.candidates} />
              </div>
              <div id="order-right-side">
                <FinalPane />
              </div>
            </div>
        );
    }
});

var stores = { OrderStore: new OrderStore() };
var flux   = new Fluxxor.Flux(stores, actions);


/*
 * Fluxxor を利用する都合上設けた、ダミーの最上位コンポーネント。
 */
var Order = React.createClass({
    propTypes: {
        user:  React.PropTypes.object.isRequired,
        order: React.PropTypes.shape({
            code:        React.PropTypes.string.isRequired,
            date:        React.PropTypes.string.isRequired,
            originator:  React.PropTypes.shape({
                code: React.PropTypes.string.isRequired,
                name: React.PropTypes.string.isRequired,
                department: React.PropTypes.shape({
                    code: React.PropTypes.string.isRequired,
                    name: React.PropTypes.string.isRequired
                })
            }),
            trader: React.PropTypes.shape({
                code: React.PropTypes.string.isRequired,
                name: React.PropTypes.string.isRequired
            }),
            finalists:   React.PropTypes.arrayOf(React.PropTypes.shape({
                goods:  React.PropTypes.shape({
                    code: React.PropTypes.string.isRequired,
                    name: React.PropTypes.string.isRequired
                }),
                maker:  React.PropTypes.shape({
                    code: React.PropTypes.string.isRequired,
                    name: React.PropTypes.string.isRequired
                }),
                price:    React.PropTypes.number.isRequired,
                quantity: React.PropTypes.number.isRequired,
                state:    React.PropTypes.oneOf([
                    'PROCESSING',
                    'ORDERED',
                    'CANCELED',
                    'DELIVERED'
                ])
            }) ).isRequired,
            state: React.PropTypes.oneOf([
                'REQUESTING',
                'APPROVING',
                'DENIED',
                'APPROVED',
                'NULLIFIED',
                'COMPLETED'

            ])
        })
    },

    render: function() {
        return <OrderManager flux={flux}
                             user={this.props.user}
                             order={this.props.order} />;
    }
});

module.exports = Order;
