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
        this.setState({ search_text: e.target.value });
    },

    onClear: function() {
        XHR.post("searchCategoriesAndTraders").send({
            category_keyid: '',
            trader_keyid:   ''
        }).end(function(err, res) {
            if (err) {
                alert('ERROR! searchCategoriesAndTraders');
                throw 'searchCategoriesAndTraders';
            }

            this.setState({
                category_keyid: '',
                trader_keyid:   '',
                search_text:    '',
                categories:     res.body.categories,
                traders:        res.body.traders 
            });
        }.bind(this) );
    },

    onSearch: function() {
        return this.getFlux().actions.updateCandidates({
            category_keyid: this.state.category_keyid,
            trader_keyid:   this.state.trader_keyid,
            search_text:    this.state.search_text
        });
    },

    componentDidMount: function() {
        this.searchCategoriesAndTraders('', '');
    },

    searchCategoriesAndTraders: function(category_id, trader_id) {
        XHR.post("searchCategoriesAndTraders").send({
            category_keyid: category_id,
            trader_keyid:   trader_id
        }).end(function(err, res) {
            if (err) {
                alert('ERROR! searchCategoriesAndTraders');
                throw 'searchCategoriesAndTraders';
            }

            this.setState({
                category_keyid: category_id,
                trader_keyid:   trader_id,
                categories:     res.body.categories,
                traders:        res.body.traders 
            });
        }.bind(this) );
    },

    render: function() {
        return (
            <fieldset className="order-pane">
              <legend>検索</legend>
              <div className="order-search-pane-input">
                <Select placeholder="品目"
                        onSelect={this.onCategorySelect}
                        value={this.state.category_keyid}
                        options={this.state.categories} />
              </div>
              <div className="order-search-pane-input">
                <Select placeholder="販売元"
                        onSelect={this.onTraderSelect}
                        value={this.state.trader_keyid}
                        options={this.state.traders} />
              </div>
              <div className="order-search-pane-input">
                <Input type="text"
                       bsSize="small"
                       placeholder="検索テキスト"
                       value={this.state.search_text}
                       onChange={this.onSearchTextChange} />
              </div>
              <Button bsSize="small"
                      onClick={this.onSearch}
                      className="order-search-pane-button">
                検索
              </Button>
              <Button bsSize="small"
                      onClick={this.onClear}
                      className="order-search-pane-button">
                クリア
              </Button>
            </fieldset>
        );
    }
});

module.exports = SearchPane;
