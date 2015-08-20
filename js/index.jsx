var React  = require('react');
var Flux   = require('fluxxor');
var Header = require('./Header');
var Nav    = require('./Nav');
var Opes   = require('./Opes');
var Footer = require('./Footer');

var user = {
    name:       '磯野 まぐろ',
    permission: 'privilige',
    medical:    true,
    urgency:    true,
    approval:   true
};

var messages = {
    ORDINARY_ORDER:  'ORDINARY_ORDER',
    URGENTRY_ORDER:  'URGENTRY_ORDER',
    MEDS_ORDER:      'MEDS_ORDER',
    ORDER_LIST:      'LIST_ORDER',
    BUDGET_ADMIN:    'BUDGET_ADMIN',
    ETC_ADMIN:       'ETC_ADMIN',
    USER_ADMIN:      'USER_ADMIN',
    TRADER_ADMIN:    'TRADER_ADMIN',
    GOODS_ADMIN:     'GOODS_ADMIN',
    PASSWORD_CHANGE: 'PASSWORD_CHANGE',
    LOGOUT:          'LOGOUT'
};

var actions = {
    ordinaryOrder: function() {
        this.dispatch(messages.ORDINARY_ORDER, {});
    },

    urgentryOrder: function() {
        this.dispatch(messages.URGENTRY_ORDER, {});
    },

    medsOrder: function() {
        this.dispatch(messages.MEDS_ORDER, {});
    },

    orderList: function() {
        this.dispatch(messages.ORDER_LIST, {});
    },

    budgetAdmin: function() {
        this.dispatch(message.BUDGET_ADMIN, {});
    },

    etcAdmin: function() {
        this.dispatch(message.ETC_ADMIN, {});
    },

    userAdmin: function() {
        this.dispatch(message.USER_ADMIN, {});
    },

    traderAdmin: function() {
        this.dispatch(message.TRADER_ADMIN, {});
    },

    goodsAdmin: function() {
        this.dispatch(message.GOODS_ADMIN, {});
    },

    passwordChange: function() {
        this.dispatch(message.PASSWORD_CHANGE, {});
    },

    logout: function() {
        this.dispatch(message.LOGOUT, {});
    }
};

var Store = Flux.createStore({
    initialize: function() {
    },

    getState: function() {
        return {};
    }
});

var Contents = React.createClass({
    render: function() {
        return (
            <div>
              <Header username={user.name} />
              <Nav user={user} />
              <Opes user={user} />
              <Footer user={user} />
            </div>
        );
    }
});

React.render(<Contents />, document.body);
