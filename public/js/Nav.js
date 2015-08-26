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
    dummy: function() {
        alert('工事中です (そっとしておいて下さい)');
    },

    ordinaryOrder: function() {
        this.props.onSelect('ORDINARY_ORDER');
    },

    urgentlyOrder: function() {
        if (this.props.user.urgency) {
            return <NavItem name="緊急発注" onClick={this.dummy} />;
        }
    },

    medsOrder: function() {
        if (this.props.user.medical) {
            return <NavItem name="薬剤発注" onClick={this.dummy} />;
        }
    },

    budgetAdmin: function() {
        if (this.props.user.permission !== 'ordinary') {
            return (
              <div>
                <NavItemTitle name="予算管理" />
                <NavItem name="予算管理" onClick={this.dummy} />
              </div>
            );
        }
    },

    etcAdmin: function() {
        var items = new Array;

        if (this.props.user.permission === 'orinary') {
            return items;
        }

        items.push(<NavItemTitle key='0' name="情報管理" />);
        items.push(<NavItem key='1'
                            name="ユーザ管理"
                            onClick={this.dummy} />);

        if (this.props.user.permission === 'privilige') {
            items.push(<NavItem key='2'
                                name="販売元管理"
                                onClick={this.dummy} />);
            items.push(<NavItem key='3'
                                name="物品管理"
                                onClick={this.dummy} />);
        }

        return items;
    },

    render: function() {
        return (
            <div id="nav">
              <NavItemTitle name="発注" />
              <NavItem name="通常発注" onClick={this.ordinaryOrder} />
              {this.urgentlyOrder()}
              {this.medsOrder()}
              <NavItem name="発注一覧" onClick={this.dummy} />
              <NavItemTitle name="経費" />
              <NavItem name="経費・精算" onClick={this.dummy} />
              {this.budgetAdmin()}
              {this.etcAdmin()}
              <NavItemTitle name="その他" />
              <NavItem name="パスワード変更" onClick={this.dummy} />
              <NavItem name="ログアウト" onClick={this.dummy} />
            </div>
        );
    }
});

module.exports = Nav;
