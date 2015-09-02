/*
 * コンテンツ領域左端のナビゲーションバー。
 * ここで選択された
 *
 *   action: これから何をしようとしているのか === 今何をしているのか
 *
 * が上位要素 (Contents) から操作領域 (Ope) に渡る。
 */
'use strict';
var React = require('react');


/*
 * action の題目。クリック不可。
 */
var NavItemTitle = React.createClass({
    propTypes: { name: React.PropTypes.string.isRequired },

    render: function() {
        return (
            <div className="nav-item-title">
              {this.props.name}
            </div>
        );
    }
});


/*
 * action の項目。
 * これをクリックすることで、action を選択する。
 */
var NavItem = React.createClass({
    propTypes: {
        name:       React.PropTypes.string.isRequired,
        onClick:    React.PropTypes.func.isRequired,
        isSelected: React.PropTypes.bool.isRequired
    },

    getInitialState: function() {
        return({ is_clickable: false });
    },


    /*
     * マウスのポインタが上空にさしかかると、選択済みでなければ、色が変わっ
     * てクリック可能であることを示す。
     */
    onMouseOver: function() {
        if (!this.props.isSelected) {
            this.setState({ is_clickable: true });
        }
    },


    /*
     * マウスのポインタが上空から去ると、色が元に戻る。
     */
    onMouseLeave: function() {
        this.setState({ is_clickable: false });
    },

    render: function() {
        var additionalClassName;

        if (this.props.isSelected) {
            // 選択済み
            additionalClassName = ' nav-selected';
        } else if (this.state.is_clickable) {
            // クリック可能なら
            additionalClassName = ' nav-clickable';
        } else {
            additionalClassName = "";
        }

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
    propTypes: {
        onSelect: React.PropTypes.func.isRequired,

        user:     React.PropTypes.shape({
            name:        React.PropTypes.string.isRequired,
            permission: React.PropTypes.oneOf([
                'privilige',
                'ordinary'
            ]).isRequired,
            medical:  React.PropTypes.bool.isRequired,
            urgency:  React.PropTypes.bool.isRequired,
            approval: React.PropTypes.bool.isRequired,
        }).isRequired,

        selected: React.PropTypes.oneOf([
            'NONE',
            'ORDINARY_ORDER',
            'URGENCY_ORDER',
            'MEDS_ORDER',
            'ORDER_LIST',
            'COST_COUNT',
            'BUDGET_ADMIN',
            'USER_ADMIN',
            'TRADER_ADMIN',
            'GOODS_ADMIN',
            'PASSWD_CHANGE',
            'LOGOUT'
        ]).isRequired
    },

    dummy: function() {
        alert('工事中です (そっとしておいて下さい)');
    },

    ordinaryOrder: function() {
        this.props.onSelect('ORDINARY_ORDER');
    },

    urgentlyOrder: function() {
        var onClick = function() {
            this.props.onSelect('URGENCY_ORDER');
        }.bind(this);

        if (this.props.user.urgency) {
            var selected = this.props.selected;

            return (
                <NavItem name="緊急発注"
                         onClick={onClick}
                         isSelected={selected === 'URGENCY_ORDER'} />
            );
        }
    },

    medsOrder: function() {
        var onClick = function() {
            this.props.onSelect('MEDS_ORDER');
        }.bind(this);

        if (this.props.user.medical) {
            return (
                <NavItem name="薬剤発注"
                         onClick={onClick}
                         isSelected={this.props.selected === 'MEDS_ORDER'} />
            );
        }
    },

    budgetAdmin: function() {
        if (this.props.user.permission !== 'ordinary') {
            return (
              <div>
                <NavItemTitle name="予算管理" />
                <NavItem name="予算管理"
                         onClick={this.dummy}
                         isSelected={this.props.selected === 'BUDGET_ADMIN'} />
              </div>
            );
        }
    },

    etcAdmin: function() {
        var items    = new Array;
        var selected = this.props.selected;

        if (this.props.user.permission === 'ordinary') {
            return items;
        }

        items.push(<NavItemTitle key='0' name="情報管理" />);
        items.push(<NavItem key='1'
                            name="ユーザ管理"
                            onClick={this.dummy}
                            isSelected={selected === 'USER_ADMIN'} />);

        if (this.props.user.permission === 'privilige') {
            items.push(<NavItem key='2'
                                name="販売元管理"
                                onClick={this.dummy}
                                isSelected={selected === 'TRADER_ADMIN'} />);
            items.push(<NavItem key='3'
                                name="物品管理"
                                onClick={this.dummy}
                                isSelected={selected === 'GOODS_ADMIN'} />);
        }

        return items;
    },

    render: function() {
        var selected = this.props.selected;

        return (
            <div id="nav">
              <NavItemTitle name="発注" />
              <NavItem name="通常発注"
                       onClick={this.ordinaryOrder}
                       isSelected={selected === 'ORDINARY_ORDER'} />
              {this.urgentlyOrder()}
              {this.medsOrder()}
              <NavItem name="発注一覧"
                       onClick={this.dummy}
                       isSelected={selected === 'ORDER_LIST'} />
              <NavItemTitle name="経費" />
              <NavItem name="経費・精算"
                       onClick={this.dummy}
                       isSelected={selected === 'COST_COUNT'} />
              {this.budgetAdmin()}
              {this.etcAdmin()}
              <NavItemTitle name="その他" />
              <NavItem name="パスワード変更"
                       onClick={this.dummy}
                       isSelected={selected === 'PASSWD_CHANGE'} />
              <NavItem name="ログアウト"
                       onClick={this.dummy}
                       isSelected={selected === 'LOGOUT'}/>
            </div>
        );
    }
});

module.exports = Nav;
