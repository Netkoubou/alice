var React = require('react');

var NavItemTitle = React.createClass({
    render: function() {
        return (
            <div className="nav-item-title">
              {this.props.name}
            </div>
        );
    }
});
        
var NavItem = React.createClass({
    getInitialState: function() {
        return({ clickable: false });
    },
    
    onMouseOver: function() {
        this.setState({ clickable: true });
    },

    onMouseLeave: function() {
        this.setState({ clickable: false });
    },

    render: function() {
        var additionalClassName = this.state.clickable? " nav-clickable": "";

        return (
            <div className={"nav-item" + additionalClassName}
                 onMouseOver={this.onMouseOver}
                 onMouseLeave={this.onMouseLeave}
                 onClick={this.props.onClick}>
              {this.props.name}
            </div>
        );
    }
});

var Nav = React.createClass({
    render: function() {
        var dummy = function() { alert("Jesus!"); };

        var urgentlyOrder = function() {
            if (this.props.user.urgency) {
                return <NavItem name="緊急発注" onClick={dummy} />;
            }
        }.bind(this);

        var medsOrder = function() {
            if (this.props.user.medical) {
                return <NavItem name="薬剤発注" onClick={dummy} />;
            }
        }.bind(this);

        var budgetAdmin = function() {
            if (this.props.user.permission !== 'ordinary') {
                return (
                  <div>
                    <NavItemTitle name="予算管理" />
                    <NavItem name="予算管理" onClick={dummy} />
                  </div>
                );
            }
        }.bind(this);

        var etcAdmin = function() {
            var perm  = this.props.user.permission;
            var items = new Array;

            if (perm === 'orinary') {
                return items;
            }

            items.push(<NavItemTitle key='0' name="情報管理" />);
            items.push(<NavItem key='1' name="ユーザ管理" onClick={dummy} />);

            if (perm === 'privilige') {
                items.push(<NavItem key='2' name="業者管理" onClick={dummy} />);
                items.push(<NavItem key='3' name="物品管理" onClick={dummy} />);
                items.push(<NavItem key='4' name="予算管理" onClick={dummy} />);
            }

            return items;
        }.bind(this);

        return (
            <div id="nav">
              <NavItemTitle name="発注" />
              <NavItem name="通常発注" onClick={dummy} />
              {urgentlyOrder()}
              {medsOrder()}
              <NavItem name="発注一覧" onClick={dummy} />
              <NavItemTitle name="経費" />
              <NavItem name="経費・精算" onClick={dummy} />
              {budgetAdmin()}
              {etcAdmin()}
              <NavItemTitle name="その他" />
              <NavItem name="パスワード変更" onClick={dummy} />
              <NavItem name="ログアウト" onClick={dummy} />
            </div>
        );
    }
});

module.exports = Nav;
