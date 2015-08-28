var React      = require('react');
var Fluxxor    = require('fluxxor');
var XHR        = require('superagent');
var SearchPane = require('./SearchPane');
var TableFrame = require('../components/TableFrame');

var CandidatePane = React.createClass({
    render: function() {
        var title = [ '品名', '製造者', '販売元', '単価' ];

        return (
            <fieldset id="order-candidate-pane" className="order-pane">
              <legend>候補</legend>
              <TableFrame id="order-candidates"
                          title={title}
                          body={this.props.candidates} />
            </fieldset>
        );
    }
});

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
    UPDATE_CANDIDATES: 'UPDATE_CANDIDATES',
};

var OrderStore = Fluxxor.createStore({
    initialize: function() {
        this.candidates = [];
        this.bindActions(
            messages.UPDATE_CANDIDATES, this.onSearch
        );
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

            this.candidates = res.body.map(function(candidate, i) {
                return { key: i, cells: candidate };
            });

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
    }
};

var OrderManager = React.createClass({
    mixins: [
        Fluxxor.FluxMixin(React),
        Fluxxor.StoreWatchMixin('OrderStore')
    ],

    getStateFromFlux: function() {
        return this.getFlux().store('OrderStore').getState();
    },

    render: function() {
        return (
            <div id="ope">
              <div id="order-left-side">
                <SearchPane />
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

var Order = React.createClass({
    render: function() { return <OrderManager flux={flux} />; }
});

module.exports = Order;
