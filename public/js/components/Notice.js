'use strict';
var React = require('react');

var Notice = React.createClass({
    propTypes: {
        title:     React.PropTypes.string.isRequired,
        id:        React.PropTypes.string,
        className: React.PropTypes.string

    },

    render: function() {
        var className = 'notice';

        if (this.props.className != undefined) {
            className += ' ' + this.props.className;
        }

        return (
            <div id={this.props.id} className={className}>
              <div className="notice-title">{this.props.title}</div>
              <div className="notice-child">{this.props.children}</div>
            </div>
        );
    }
});

module.exports = Notice;
