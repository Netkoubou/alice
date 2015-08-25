var React  = require('react');
var Input  = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var XHR    = require('superagent');
var Select = require('../Select');

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
        XHR.post("cgi/search.js").send({
            category_keyid: this.state.category_keyid,
            trader_keyid:   this.state.trader_keyid,
            search_text:    this.state.search_text
        }).end(function(err, res) {
            if (err) {
                alert("ERROR! cgi/search.js");
            } else {
                this.setState({
                    categories: res.categories,
                    traders:    res.traders
                });
            }
        });
    },

    render: function() {
        return (
            <fieldset id="opes-search-pane">
              <legend>検索</legend>
              <div>
                <Select placeholder="品目"
                        onSelect={this.onCategorySelect}
                        options={this.state.categories} />
              </div>
              <div>
                <Select placeholder="販売元"
                        onSelect={this.onTraderSelect}
                        options={this.state.traders} />
              </div>
              <div>
                <Input type="text"
                       placeholder="検索テキスト"
                       value={this.state.search_text}
                       onChange={this.onSearchTextChange} />
              </div>
              <Button>検索</Button>
            </fieldset>
        );
    }
});

var CandidatePane = React.createClass({
    render: function() {
        return (
            <fieldset id="opes-candidate-pane">
              <legend>候補</legend>
            </fieldset>
        );
    }
});

var FinalPane = React.createClass({
    render: function() {
        return (
            <fieldset id="opes-final-pane">
              <legend>確定</legend>
            </fieldset>
        );
    }
});

module.exports = {
    SearchPane:    SearchPane,
    CandidatePane: CandidatePane,
    FinalPane:     FinalPane
};
