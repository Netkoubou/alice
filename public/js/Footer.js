'use strict';
var React  = require('react');
var XHR    = require('superagent');

var timer  = null;
var Footer = React.createClass({
    getInitialState: function() {
        return ({
            message: 'おしらせはありません。',
            style:   'footer-ordinary'
         });
    },

    getMessage: function() {
        XHR.get('getFooterMessage').set({
            'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT'
        }).end(function(err, res) {
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
        timer = setInterval(this.getMessage, 240000);
    },

    componentWillUnmount: function() {
        if (timer != null) {
            clearInterval(timer);
        }
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
