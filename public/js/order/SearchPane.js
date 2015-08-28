var React   = require('react');
var Input   = require('react-bootstrap').Input;
var Button  = require('react-bootstrap').Button;
var XHR     = require('superagent');
var Fluxxor = require('fluxxor');
var Select  = require('../components/Select');

var SearchPane = React.createClass({
    mixins: [ Fluxxor.FluxMixin(React) ],

    getInitialState: function() {
        return {
            category_keyid: '',
            trader_keyid:   '',
            search_text:    '',
            categories:     [],
            traders:        []
        };
    },

    onCategorySelect: function(e) {
        this.searchCategoriesAndTraders(e.keyid, this.state.trader_keyid);
    },

    onTraderSelect: function(e) {
        this.searchCategoriesAndTraders(this.state.category_keyid, e.keyid);
    },

    onSearchTextChange: function(e) {
        this.setState({ search_text: e.value });
    },

    onSearch: function() {
        return this.getFlux().actions.updateCandidates({
            category_keyid: this.state.category_keyid,
            trader_keyid:   this.state.trader_keyid,
            search_text:    this.state.search_text
        });
    },

    searchCategoriesAndTraders: function(category_keyid, trader_keyid) {
        XHR.post("searchCategoriesAndTraders").send({
            category_keyid: category_keyid,
            trader_keyid:   trader_keyid
        }).end(function(err, res) {
            if (err) {
                alert('ERROR! searchCategoriesAndTraders');
                throw 'searchCategoriesAndTraders';
            }

            this.setState({
                category_keyid: category_keyid,
                trader_keyid:   trader_keyid,
                categories:     res.body.categories,
                traders:        res.body.traders 
            });
        }.bind(this) );
    },

    componentDidMount: function() {
        this.searchCategoriesAndTraders('', '');
    },

    render: function() {
        return (
            <fieldset className="order-pane">
              <legend>検索</legend>
              <div className="order-search-pane-input">
                <Select placeholder="品目"
                        onSelect={this.onCategorySelect}
                        options={this.state.categories} />
              </div>
              <div className="order-search-pane-input">
                <Select placeholder="販売元"
                        onSelect={this.onTraderSelect}
                        options={this.state.traders} />
              </div>
              <div className="order-search-pane-input">
                <Input type="text"
                       bsSize="small"
                       placeholder="検索テキスト"
                       onChange={this.onSearchTextChange} />
              </div>
              <Button bsSize="small"
                      onClick={this.onSearch}
                      id="order-search-pane-button">
                検索
              </Button>
            </fieldset>
        );
    }
});

module.exports = SearchPane;
