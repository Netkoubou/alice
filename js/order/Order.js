var React  = require('react');
var Input  = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var Select = require('../Select');

var SearchPane = React.createClass({
    getInitialState: function() {
        return {
            category_keyid: '',
            trader_keyid:   '',
            search_text:    ''
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

    render: function() {
        var categories = [
            { keyid: '0', desc: '凄いアレ' },
            { keyid: '1', desc: '驚きのソレ' },
            { keyid: '2', desc: 'ありえないナニ' }
        ];

        var traders = [
            { keyid: '0', desc: '阿漕商店' },
            { keyid: '1', desc: 'バッタモン市場' },
            { keyid: '2', desc: '贋物マーケット' }
        ];

        return (
            <fieldset id="opes-search-pane">
              <legend>検索</legend>
              <div>
                <Select placeholder="品目"
                        onSelect={this.onCategorySelect}
                        options={categories} />
              </div>
              <div>
                <Select placeholder="販売元"
                        onSelect={this.onTraderSelect}
                        options={traders} />
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
