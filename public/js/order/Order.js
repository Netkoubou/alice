var React      = require('react');
var SearchPane = require('./SearchPane');

var CandidatePane = React.createClass({
    render: function() {
        return (
            <fieldset className="order-pane">
              <legend>候補</legend>
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

var Order = React.createClass({
    render: function() {
        return (
            <div>
              <div id="order-left-side">
                <SearchPane />
                <CandidatePane />
              </div>
              <div id="order-right-side">
                <FinalPane />
              </div>
            </div>
        );
    }
});

module.exports = Order;
