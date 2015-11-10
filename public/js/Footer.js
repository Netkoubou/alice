'use strict';
var React  = require('react');
var XHR    = require('superagent');

var Footer = React.createClass({
    getInitialState: function() {
        return ({
            message: 'おしらせはありません。',
            style:   'footer-ordinary'
         });
    },

    getMessage: function() {
        XHR.get('getFooterMessage').end(function(err, res) {
            if (res.body.status == 0) {
                var message = res.body.message.replace(/(^\s+)|(\s+$)/g, '');

                if (message != '') {
                    this.setState({
                        message: message,
                        style:   'footer-urgency'
                    });
                } else {
                    this.setState({
                        message: 'おしらせはありません。',
                        style:   'footer-ordinary'
                    });
                }
            }
        }.bind(this) );
    },

    componentDidMount: function() {
        this.getMessage();
        setInterval(this.getMessage, 240000);
    },

    render: function() {
        return (
            <footer id="footer">
              <div id="footer-telop">
                <p id="footer-text" className={this.state.style}>
                  {this.state.message}
                </p>
              </div>
            </footer>
        );
    }
});

module.exports = Footer;
