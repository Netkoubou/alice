'use strict';
var React = require('react');

var Header = React.createClass({
    propTypes: {
        user:      React.PropTypes.object.isRequired,
        appearNav: React.PropTypes.func.isRequired
    },

    render: function() {
        var subsysname = 'Supply Processing & Distribution';

        /*
        var selector = Math.random();
        var subsysname;

        if (selector < 0.01) {
            // 開国してくださいよ
            subsysname = 'Open your contry, please...';
        } else if (selector < 0.02) {
            // 開国すれば良いのです
            subsysname = 'It\'s OK only to open your country!';
        } else if (selector < 0.03) {
            // 鎖国最低
            subsysname = 'It\'s suck bad to close a country!';
        } else if (selector < 0.04) {
            // たった四杯で夜も寝られず
            subsysname = 'Just four disturbs our sleep.';
        } else {
            subsysname = 'Supply Processing & Distribution';
        }
        */

        return (
          <div id="header">
            <img id="header-logo"
                 src="img/logo.png"
                 onClick={this.props.appearNav} />
            <div id="header-systitle">
              <div id="header-sysname">次世代物品調達システム</div>
              <span id="header-subsysname">
                {subsysname}
              </span>
            </div>
            <div id="header-petname">Perry</div>
            <div id="header-welcome">
              ようこそ
              <span id="header-account">
                {this.props.user.name + ' (' + this.props.user.account + ')'}
              </span>様
            </div>
          </div>
        );
    }
});

module.exports = Header;
