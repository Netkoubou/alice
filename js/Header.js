var React = require('react');

var Header = React.createClass({
    render: function() {
        return (
            <header id="header">
              <div>
                <div id="header-upper">
                  <img src="img/kdulogo.png" />
                  <span id="header-petname">Alice</span>
                  <div id="header-welcome">
                    ようこそ
                    <span id="header-username">{this.props.username}</span>
                    様
                  </div>
                </div>
                <div id="header-lower">Supply Processing Distribution</div>
              </div>
            </header>
        );
    }
});

module.exports = Header;
