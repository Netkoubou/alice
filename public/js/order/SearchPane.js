var React  = require('react');
var Input  = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var XHR    = require('superagent');
var Select = require('../components/Select');

var SearchPane = React.createClass({
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
        this.setState({
            category_keyid: e.keyid,
            trader_keyid:   this.state.keyid,
            search_text:    this.state.search_text
        });
    },

    onTraderSelect: function(e) {
        this.setState({
            category_keyid: this.state.category_keyid,
            trader_keyid:   e.keyid,
            search_text:    this.state.search_text
        });
    },

    onSearchTextChange: function(e) {
        this.setState({
            category_keyid: this.state.category_keyid,
            trader_keyid:   this.state.trader_keyid,
            search_text:    e.search_text
        });
    },

    componentDidMount: function() {
        XHR.post("searchCategoriesAndTraders").send({
            category_keyid: this.state.category_keyid,
            trader_keyid:   this.state.trader_keyid,
            search_text:    this.state.search_text
        }).end(function(err, res) {
            if (err) {
                alert("ERROR! searchCategoriesAndTraders");
            } else {
                this.setState({
                    categories: res.body.categories,
                    traders:    res.body.traders
                });
            }
        }.bind(this) );
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
                       placeholder="検索テキスト"
                       value={this.state.search_text}
                       onChange={this.onSearchTextChange} />
              </div>
              <Button id="order-search-pane-button">検索</Button>
            </fieldset>
        );
    }
});

module.exports = SearchPane;
