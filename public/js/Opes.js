var React = require('react');
var Order = require('./order/Order');

var Opes = React.createClass({
    render: function() {
        switch (this.props.action) {
        case 'ORDINARY_ORDER':
            return (
                <div>
                  <div id="opes-left">
                    <Order.SearchPane />
                    <Order.CandidatePane />
                  </div>
                  <Order.FinalPane />
                </div>
            );
            break;
        default:
            return(<div></div>);
        }
    }
});

module.exports = Opes;
