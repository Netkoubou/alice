/*
 * 操作領域
 */
'use strict';
var React      = require('react');
var EditOrder  = require('./order/EditOrder');
var ListOrders = require('./order/ListOrders');


/*
 * 上位要素である Nav から属性として user を貰って来るが、
 * Nav でその検証は済んでいるため、以降は細かい検証をスルー。
 */
var Ope = React.createClass({
    propTypes: {
        user:   React.PropTypes.object.isRequired,
        action: React.PropTypes.oneOf([
            'NONE',
            'DRAFT_ORDINARY_ORDER',
            'DRAFT_URGENCY_ORDER',
            'DRAFT_MEDS_ORDER',
            'LIST_ORDERS',
            'COUNT_COST',
            'VIEW_BUDGET',
            'MANAGE_BUDGET',
            'MANAGE_USERS',
            'MANAGE_TRADERS',
            'MANAGE_PRODUCTS',
            'CHANGE_PASSWORD',
            'LOGOUT'
        ]).isRequired
    },

    render: function() {
        var contents;

        switch (this.props.action) {
        case 'DRAFT_ORDINARY_ORDER':
        case 'DRAFT_URGENCY_ORDER':
        case 'DRAFT_MEDS_ORDER':
            /*
             * 以下の key を指定することで、発注の操作を (例えば、通常発注か
             * ら緊急発注へ) 切り替えた時に、検索ペインが再描画される。
             */
            contents = <EditOrder key={Math.random()}
                                  account={this.props.user.account}
                                  action={this.props.action} />;
            break;
        case 'LIST_ORDERS':
            contents = <ListOrders key={Math.random()}
                                   user={this.props.user} />
            break;
        default:
            contents = null;
        }

        return contents;
    }
});

module.exports = Ope;
