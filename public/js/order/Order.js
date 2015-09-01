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

var FinalPane = React.createClass({
    render: function() {
        return (
            <fieldset className="order-pane">
              <legend>確定</legend>
            </fieldset>
        );
    }
});

var messages = {
    UPDATE_CANDIDATES: 'UPDATE_CANDIDATES'
};

var OrderStore = Fluxxor.createStore({
    initialize: function() {
        this.candidates = [];
        this.bindActions(messages.UPDATE_CANDIDATES, this.onSearch);
    },

    onSearch: function(payload) {
        XHR.post('pickCandidates').send({
            category_keyid: payload.category_keyid,
            trader_keyid:   payload.trader_keyid,
            search_text:    payload.search_text
        }).end(function(err, res) {
            if (err) {
                alert('ERROR! pickCandidates');
                throw 'pickCandidates';
            }

            this.candidates = res.body;
            this.emit('change');
        }.bind(this) );
    },

    getState: function() {
        return {
            candidates: this.candidates
        }
    }
});

var actions = {
    updateCandidates: function(payload) {
        this.dispatch(messages.UPDATE_CANDIDATES, payload);
    },
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
        this.state.candidates = [];
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
 * Ope から属性として user が渡て来るが、既に Ope の PropType でその検証は
 * 済んでいるため、以降は細かい検証をスルー。
 */
var Order = React.createClass({
    propTypes: { user: React.PropTypes.object.isRequired },

    render: function() {
        return <OrderManager flux={flux} user={this.props.user} />;
    }
});

module.exports = Order;
