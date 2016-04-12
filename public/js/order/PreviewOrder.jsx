'use strict';
var React      = require('react');
var ReactDOM   = require('react-dom');
var OrderSheet = require('./OrderSheet');

var PreviewOrder = React.createClass({
    render: function() {
        return (
            <div id="preview-order">
              <OrderSheet info={window.opener.info} />
              <button onClick={window.print}>印刷</button>
            </div>
        );
    }
});

ReactDOM.render(<PreviewOrder />, document.getElementById('contents-area') );
