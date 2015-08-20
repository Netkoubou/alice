var React = require('react');

var SearchPane = React.createClass({
    render: function() {
        return (
            <div id="opes-search-pane">
              検索ペイン
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
