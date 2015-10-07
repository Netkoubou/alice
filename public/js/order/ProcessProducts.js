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
        var 
        return {
            order_remark: this.props.order.order_remark,
            products:     data
        };
    },

    onChangeRemark: function(e) {
        this.setState({ order_remark: e.target.value });
    },

    render: function() {
        var title = [
            { name: '品名',     type: 'string' },
            { name: '製造元',   type: 'string' },
            { name: '最安単価', type: 'number' },
            { name: '現在単価', type: 'number' },
            { name: '最高単価', type: 'number' },
            { name: '数量',     type: 'number' },
            { name: '発注小計', type: 'number' },
            { name: '請求額',   type: 'number' },
            { name: '状態',     type: 'string' }
        ];

        var data = this.props.order.products.map(function(product) {
            return (
            );
        }.bind(this) );

        return (
            <div id="order-process-products">
              <OrderInfos legend="物品処理"
                          order={this.props.order}
                          orderRemark={this.state.order_remark}
                          onChangeRemark={this.onChangeRemark} />
              <TableFrame id="order-process-products-products"
                          title={title}
                          data={data} />
              <OrderInfos.Totals order={this.props.order} />
            </div>
        );
    }
});

module.exports = ProcessProducts;
