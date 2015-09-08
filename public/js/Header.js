'use strict';
var React  = require('react');
var Header = React.createClass({
    propTypes: {
        username: React.PropTypes.string.isRequired
    },

    render: function() {
        return (
          <div id="header">
            <img id="header-logo" src="img/logo.png" />
            <div id="header-systitle">
              <div id="header-sysname">次世代物品調達システム</div>
              <span id="header-subsysname">
                Supply Processing Distribution
              </span>
            </div>
            <div id="header-petname">Perry</div>
            <div id="header-welcome">
              ようこそ<span id="header-username">{this.props.username}</span>様
            </div>
          </div>
        );
    }
});

module.exports = Header;
