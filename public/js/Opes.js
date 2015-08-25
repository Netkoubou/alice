var React = require('react');
var Order = require('./order/Order');

var Opes = React.createClass({
    render: function() {
        return (
            <div>
              <div id="opes-left">
                <Order.SearchPane />
                <Order.CandidatePane />
              </div>
              <Order.FinalPane />
            </div>
        );
    }
});

module.exports = Opes;
