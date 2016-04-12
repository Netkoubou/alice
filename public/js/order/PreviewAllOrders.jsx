'use strict';

var React      = require('react');
var ReactDOM   = require('react-dom');
var OrderSheet = require('./OrderSheet');

var PreviewAllOrders = React.createClass({
    componentDidMount: function() {
        window.print();
    },

    render: function() {
        var order_sheets = window.opener.orders.map(function(o, i) {
            return <OrderSheet key={i} info={o} />;
        });

        return (
            <div id="preview-order">
              {order_sheets}
            </div>
        );
    }
});

ReactDOM.render(
    <PreviewAllOrders />, 
    document.getElementById('contents-area')
);
