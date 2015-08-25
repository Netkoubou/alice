var React = require('react');

var Footer = React.createClass({
    getInitialState: function() {
        return ({ message: 'とんでもないことになっています。' });
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
