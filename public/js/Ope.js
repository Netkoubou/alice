/*
 * 操作領域
 */
'use strict';
var React     = require('react');
var Order     = require('./order/Order');
var OrderList = require('./order/OrderList');


/*
 * 上位要素である Nav から属性として user を貰って来るが、
 * Nav でその検証は済んでいるため、以降は細かい検証をスルー。
 */
var Ope = React.createClass({
    propTypes: {
        user:   React.PropTypes.object.isRequired,
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
            /*
             * 以下の key を指定することで、発注の操作を (例えば、通常発注か
             * ら緊急発注へ) 切り替えた時に、検索ペインが再描画される。
             */
            contents = <Order key={Math.random()}
                              account={this.props.user.account}
                              action={this.props.action} />;
            break;
        case 'ORDER_LIST':
            contents = <OrderList key={Math.random()} user={this.props.user} />
            break;
        default:
            contents = null;
        }

        return contents;
    }
});

module.exports = Ope;
