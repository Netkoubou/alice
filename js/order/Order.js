var React  = require('react');
var Select = require('../Select');

var SearchPane = React.createClass({
    getInitialState: function() {
        return {
            cat_keyid:    '',
            trader_keyid: ''
        };
    },

    render: function() {
        var categories = [
            { keyid: '0', desc: '凄いアレ' },
            { keyid: '1', desc: '驚きのソレ' },
            { keyid: '2', desc: 'ありえないナニ' }
        ];

        return (
            <div id="opes-search-pane">
              <Select options={categories} />
            </div>
        );
    }
});

var CandidatePane = React.createClass({
    render: function() {
        return (
            <div id="opes-candidate-pane">
              候補ペイン
            </div>
        );
    }
});

var FinalPane = React.createClass({
    render: function() {
        return (
            <div id="opes-final-pane">
              確定ペイン
            </div>
        );
    }
});

module.exports = {
    SearchPane:    SearchPane,
    CandidatePane: CandidatePane,
    FinalPane:     FinalPane
};
