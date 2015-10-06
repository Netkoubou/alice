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
        isSelected: React.PropTypes.bool.isRequired,
        bottom:     React.PropTypes.bool
    },

    render: function() {
        var className = this.props.isSelected? 'nav-item-selected': 'nav-item';

        if (this.props.bottom != undefined && this.props.bottom) {
            className += ' nav-item-bottom';
        }

        return (
            <div className={className} onClick={this.props.onClick}>
              {this.props.name}
            </div>
        );
    }
});

var Nav = React.createClass({
    propTypes: {
        onSelect: React.PropTypes.func.isRequired,

        user: React.PropTypes.shape({
            account:     React.PropTypes.string.isRequired,
            is_privileged: React.PropTypes.bool.isRequired,
            is_admin:      React.PropTypes.bool.isRequired,
            is_medical:    React.PropTypes.bool.isRequired,
            is_urgency:    React.PropTypes.bool.isRequired,
            is_approval:   React.PropTypes.bool.isRequired
        }).isRequired,

        selected: React.PropTypes.oneOf([
            'NONE',                     // 未選択
            'DRAFT_ORDINARY_ORDER',     // 通常発注起案
            'DRAFT_URGENCY_ORDER',      // 緊急発注起案
            'DRAFT_MEDS_ORDER',         // 薬剤発注起案
            'LIST_ORDERS',              // 発注一覧
            'COUNT_COST',               // 経費・精算
            'VIEW_BUDGET',              // 予算一覧
            'MANAGE_BUDGET',            // 予算管理
            'MANAGE_USERS',             // ユーザ管理
            'MANAGE_TRADERS',           // 販売元管理
            'NAMAGE_PRODUCTS',          // 物品管理
            'CHANGE_PASSWORD',          // パスワード変更
            'LOGOUT'
        ]).isRequired
    },


    /*
     * 最初にページが表示された時は、ナビゲーションバーを表示する (隠さない)
     */
    getInitialState: function() { return { nav_id: 'nav-first' } },

    dummy: function() {
        alert('工事中です (そっとしておいて下さい)');
    },

    onSelect: function(action) {
        return function() {
            this.props.onSelect(action);
            this.setState({ nav_id: 'nav' });
        }.bind(this);
    },

    render: function() {
        var urgently_order = null;
        var meds_order     = null;
        var budget_admin   = null;
        var etc_admin      = null;
        var selected       = this.props.selected;

        if (this.props.user.is_urgency) {
            urgently_order = (
                <NavItem name="緊急発注起案"
                         onClick={this.onSelect('DRAFT_URGENCY_ORDER')}
                         isSelected={selected === 'DRAFT_URGENCY_ORDER'} />
            );
        }

        if (this.props.user.is_medical) {
            meds_order = (
                <NavItem name="薬剤発注起案"
                         onClick={this.onSelect('DRAFT_MEDS_ORDER')}
                         isSelected={selected === 'DRAFT_MEDS_ORDER'} />
            );
        }

        if (this.props.user.is_admin) {
            if (this.props.user.is_privileged) {
                budget_admin = (
                    <div>
                      <NavItemTitle name="予算" />
                      <NavItem name="予算一覧"
                               onClick={this.dummy}
                               isSelected={selected === 'VIEW_BUDGET'} />
                      <NavItem name="予算管理"
                               onClick={this.dummy}
                               isSelected={selected === 'MANAGE_BUDGET'} />
                   </div>
                );
            } else {
                budget_admin = (
                    <div>
                      <NavItemTitle name="予算" />
                      <NavItem name="予算一覧"
                               onClick={this.dummy}
                               isSelected={selected === 'VIEW_BUDGET'} />
                    </div>
                );
            }
        }

        if (this.props.user.is_admin) {
            etc_admin = (
                <div>
                  <NavItemTitle key='0' name="情報管理" />
                  <NavItem key='1'
                           name="ユーザ管理"
                           onClick={this.dummy}
                           isSelected={selected === 'MANAGE_USERS'} />
                  <NavItem key='2'
                           name="販売元管理"
                           onClick={this.dummy}
                           isSelected={selected === 'MANAGE_TRADERS'} />
                  <NavItem key='3'
                           name="物品管理"
                           onClick={this.dummy}
                           isSelected={selected === 'MANAGE_PRODUCTS'} />
                </div>
            );
        }

        return (
            <div id={this.state.nav_id}>
              <NavItemTitle name="発注" />
              <NavItem name="通常発注起案"
                       onClick={this.onSelect('DRAFT_ORDINARY_ORDER')}
                       isSelected={selected === 'DRAFT_ORDINARY_ORDER'} />
              {urgently_order}
              {meds_order}
              <NavItem name="発注一覧"
                       onClick={this.onSelect('LIST_ORDERS')}
                       isSelected={selected === 'LIST_ORDERS'} />
              <NavItemTitle name="経費" />
              <NavItem name="経費・精算"
                       onClick={this.dummy}
                       isSelected={selected === 'COUNT_COST'} />
              {budget_admin}
              {etc_admin}
              <NavItemTitle name="その他" />
              <NavItem name="パスワード変更"
                       onClick={this.dummy}
                       isSelected={selected === 'CHANGE_PASSWORD'} />
              <NavItem name="ログアウト"
                       onClick={this.dummy}
                       isSelected={selected === 'LOGOUT'}
                       bottom={true}  />
            </div>
        );
    }
});

module.exports = Nav;
