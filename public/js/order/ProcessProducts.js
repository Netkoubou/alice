'use strict'
var React      = require('react');
var Button     = require('react-bootstrap').Button;
var XHR        = require('superagent');
var OrderInfos = require('./OrderInfos');
var TableFrame = require('../components/TableFrame');
var Messages   = require('../lib/Messages');
var Util       = require('../lib/Util');

var ProcessProducts = React.createClass({
    propTypes: {
        order:  React.PropTypes.object.isRequired,
        goBack: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return { order_remark: this.props.order.order_remark };
    },

    onChangeRemark: function(e) {
        this.setState({ order_remark: e.target.value });
    },

    render: function() {
        return (
            <div id="order-process-products">
              <OrderInfos legend="物品処理"
                          order={this.props.order}
                          orderRemark={this.state.order_remark}
                          onChangeRemark={this.onChangeRemark} />
              <OrderInfos.Totals order={this.props.order} />
            </div>
        );
    }
});

module.exports = ProcessProducts;
