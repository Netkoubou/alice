var React = require('react');
var Order = require('./order/Order');

var Ope = React.createClass({
    render: function() {
        var contents;

        switch (this.props.action) {
        case 'ORDINARY_ORDER':
            contents = <Order user={this.props.user} />;
            break;
        default:
            contents = null;
        }

        return contents;
    }
});

module.exports = Ope;
