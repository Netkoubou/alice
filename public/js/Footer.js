'use strict';
var React  = require('react');
var Footer = React.createClass({
    getInitialState: function() {
        return ({ message: '1854 年 3 月 31 日 開国です! (具体的には日米和親条約調印)' });
    },

    render: function() {
        return (
            <footer id="footer">
              <div id="footer-telop">
                <p id="footer-text">{this.state.message}</p>
              </div>
            </footer>
        );
    }
});

module.exports = Footer;
