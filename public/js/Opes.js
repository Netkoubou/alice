var React = require('react');
var Order = require('./order/Order');

var Opes = React.createClass({
    render: function() {
        switch (this.props.action) {
        case 'ORDINARY_ORDER':
            return(<Order user={this.props.user} />);
            break;
        default:
            return(<div />);
        }
    }
});

module.exports = Opes;
