/*
 * 操作領域
 */
'use strict';
var React = require('react');
var Order = require('./order/Order');

var Ope = React.createClass({
    propTypes: {
        user:     React.PropTypes.shape({
            code:       React.PropTypes.string.isRequired,
            name:       React.PropTypes.string.isRequired,
            permission: React.PropTypes.oneOf([
                'privilige',
                'ordinary'
            ]).isRequired,
            medical:  React.PropTypes.bool.isRequired,
            urgency:  React.PropTypes.bool.isRequired,
            approval: React.PropTypes.bool.isRequired,
        }).isRequired,

        action: React.PropTypes.oneOf([
            'NONE',
            'ORDINARY_ORDER',
            'URGENCY_ORDER',
            'MEDS_ORDER',
            'ORDER_LIST',
            'COST_COUNT',
            'BUDGET_ADMIN',
            'USER_ADMIN',
            'TRADER_ADMIN',
            'GOODS_ADMIN',
            'PASSWD_CHANGE',
            'LOGOUT'
        ]).isRequired
    },

    render: function() {
        var contents;

        switch (this.props.action) {
        case 'ORDINARY_ORDER':
        case 'URGENCY_ORDER':
        case 'MEDS_ORDER':
            contents = <Order user={this.props.user} />;
            break;
        default:
            contents = null;
        }

        return contents;
    }
});

module.exports = Ope;
