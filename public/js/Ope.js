/*
 * 操作領域
 */
'use strict';
var React      = require('react');

var EditOrder  = require('./order/EditOrder');
var ListOrders = require('./order/ListOrders');

var ChangePassword  = require('./others/ChangePassword');
var RegisterMessage = require('./others/RegisterMessage');

var ApplyCost = require('./cost/ApplyCost');
var ListCosts = require('./cost/ListCosts');


/*
 * 上位要素である Nav から属性として user と action を貰って来るが、
 * Nav でそれらの検証は済んでいるため、以降は細かい検証をスルー。
 */
var Ope = React.createClass({
    propTypes: {
        user:   React.PropTypes.object.isRequired,
        action: React.PropTypes.string.isRequired
    },

    render: function() {
        var contents;

        switch (this.props.action) {
        case 'DRAFT_ORDINARY_ORDER':
        case 'DRAFT_URGENCY_ORDER':
            /*
             * 以下の key を指定することで、発注の操作を (例えば、通常発注か
             * ら緊急発注へ) 切り替えた時に、検索ペインが再描画される。
             */
            contents = <EditOrder key={Math.random()}
                                  user={this.props.user}
                                  action={this.props.action} />;
            break;
        case 'LIST_ORDERS':
            contents = <ListOrders key={Math.random()}
                                   user={this.props.user} />;
            break;
        case 'CHANGE_PASSWORD':
            contents = <ChangePassword />;
            break;
        case 'REGISTER_MESSAGE':
            contents = <RegisterMessage />;
            break;
        case 'APPLY_COST':
            contents = <ApplyCost />;
            break;
        case 'LIST_COSTS':
            contents = <ListCosts key={Math.random()}
                                  user={this.props.user} />;
            break;
        default:
            contents = null;
        }

        return contents;
    }
});

module.exports = Ope;
