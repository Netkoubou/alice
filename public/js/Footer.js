'use strict';
var React  = require('react');
var Footer = React.createClass({
    getInitialState: function() {
        return ({ message: '開国して下さい!' });
    },

    render: function() {
        return (
            <footer id="footer">
              {this.state.message}
            </footer>
        );
    }
});

module.exports = Footer;
