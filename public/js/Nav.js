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
        user: React.PropTypes.shape({
            account:    React.PropTypes.string.isRequired,
            name:       React.PropTypes.string.isRequired,
            privileged: React.PropTypes.shape({
                administrate:     React.PropTypes.bool.isRequired,
                draft_ordinarily: React.PropTypes.bool.isRequired,
                draft_urgently:   React.PropTypes.bool.isRequired,
                process_order:    React.PropTypes.bool.isRequired,
                approve:          React.PropTypes.bool.isRequired
            }).isRequired,
            departments: React.PropTypes.arrayOf(React.PropTypes.shape({
                code:             React.PropTypes.string.isRequired,
                administrate:     React.PropTypes.bool.isRequired,
                draft_ordinarily: React.PropTypes.bool.isRequired,
                draft_urgently:   React.PropTypes.bool.isRequired,
                process_order:    React.PropTypes.bool.isRequired,
                approve:          React.PropTypes.bool.isRequired
            }) ).isRequired
        }).isRequired,

        onSelect: React.PropTypes.func.isRequired,
        logout:   React.PropTypes.func.isRequired,

        selected: React.PropTypes.oneOf([
            'NONE',                     // 未選択
            'DRAFT_ORDINARY_ORDER',     // 通常発注起案
            'DRAFT_URGENCY_ORDER',      // 緊急発注起案
            'LIST_ORDERS',              // 発注一覧
            'APPLY_COST',               // 経費精算申請起案
            'LIST_COSTS',               // 経費精算申請一覧
            'LIST_BUDGET',              // 予算一覧
            'ADMIN_BUDGET',             // 予算管理
            'MANAGE_USERS',             // ユーザ管理
            'MANAGE_DEPARTMENTS',       // 部門診療科情報管理
            'MANAGE_TRADERS',           // 販売元情報管理
            'NAMAGE_PRODUCTS',          // 物品情報管理
            'REGISTER_MESSAGE',         // フッタに表示するメッセージの登録
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
        var is_admin            = false;    // 管理者か?
        var is_ordinary_drafter = false;    // 通常発注権限があるか?
        var is_urgency_drafter  = false;    // 緊急発注権限があるか?
        var can_list_order      = false;    // 発注一覧を参照できるか?


        /*
         * ユーザに何をさせて良いのか、何をさせてはダメなのか、
         * の判断が結構複雑であるため、if 文をすっきりさせるため、
         * その判断用のフラグを利用することにした。
         * ここから、そのフラグの設定用コード。
         */
        this.props.user.departments.forEach(function(d) {
            if (d.administrate) {
                /*
                 * 所属する部門診療科の中で、一つでも administrate フラグ
                 * が立っていたら、つまり当該部門診療科の各種情報を管理する
                 * 権限があるなら、、情報管理のメニュー項目を表示する。
                 */
                is_admin = true;
            }

            if (d.draft_ordinarily) {
                /*
                 * 通常発注起案について同上
                 */
                is_ordinary_drafter = true;
                can_list_order      = true;
            }

            if (d.draft_urgently) {
                /*
                 * 緊急発注起案について同上
                 */
                is_urgency_drafter = true;
                can_list_order     = true;
            }

            if (d.process_order || d.approve) {
                /*
                 * 発注を処理したり承認したりするには、
                 * 発注を一覧できる必要がある。
                 */
                can_list_order = true;
            }
        });


        /*
         * 所属する部門診療科で、各種権限のフラグが立っていなくても、
         * privileged でフラグが立っていたら、問答無用でその権限が
         * あることになる。
         * 以下、そのためのコード。
         */
        var privileged = this.props.user.privileged;

        if (!is_admin && privileged.administrate) {
            is_admin = true;
        }

        if (!is_ordinary_drafter && privileged.draft_ordinarily) {
            is_ordinary_drafter = true;
        }

        if (!is_urgency_drafter && privileged.draft_urgently) {
            is_urgency_drafter = true;
        }

        if (!can_list_order) {
            if (privileged.process_order || privileged.approve) {
                can_list_order = true;
            }
        }


        /*
         * 以上で、ユーザが何をできるか、のフラグを設定し終わったので、
         * 以下、それに合わせて表示して良いメニュー項目を設定していく。
         */
        var draft_order = [];
        var budget      = [];
        var admin       = null;
        var selected    = this.props.selected;

        if (is_ordinary_drafter) {
            draft_order.push(
                <NavItem key="1"
                         name="通常起案"
                         onClick={this.onSelect('DRAFT_ORDINARY_ORDER')}
                         isSelected={selected === 'DRAFT_ORDINARY_ORDER'} />
            );
        }

        if (is_urgency_drafter) {
            draft_order.push(
                <NavItem key="2"
                         name="緊急起案"
                         onClick={this.onSelect('DRAFT_URGENCY_ORDER')}
                         isSelected={selected === 'DRAFT_URGENCY_ORDER'} />
            );
        }

        if (can_list_order) {
            draft_order.push(
                <NavItem key="3"
                         name="一覧"
                         onClick={this.onSelect('LIST_ORDERS')}
                         isSelected={selected === 'LIST_ORDERS'} />
            );
        }

        if (draft_order.length != 0) {
            draft_order.unshift(<NavItemTitle key="0" name="発注" />);
        }

        if (is_admin) {
            budget.push(<NavItemTitle key="0" name="予算" />);
            budget.push(
                <NavItem key="1"
                         name="一覧"
                         onClick={this.dummy}
                         isSelected={selected === 'LIST_BUDGET'} />
            );
        }

        if (this.props.user.privileged.administrate) {
            budget.push(<NavItem key="2"
                                 name="管理"
                                 onClick={this.dummy}
                                 isSelected={selected === 'ADMIN_BUDGET'} />
            );
        }

        if (this.props.user.privileged.administrate) {
            admin = (
                <div>
                  <NavItemTitle name="システム管理" />
                  <NavItem name="ユーザ"
                           onClick={this.onSelect('MANAGE_USERS')}
                           isSelected={selected === 'MANAGE_USERS'} />
                  <NavItem name="部門診療科"
                           onClick={this.dummy}
                           isSelected={selected === 'MANAGE_DEPARTMENTS'} />
                  <NavItem name="販売元"
                           onClick={this.dummy}
                           isSelected={selected === 'MANAGE_TRADERS'} />
                  <NavItem name="物品"
                           onClick={this.dummy}
                           isSelected={selected === 'MANAGE_PRODUCTS'} />
                  <NavItem name="メッセージ"
                           onClick={this.onSelect('REGISTER_MESSAGE')}
                           isSelected={selected === 'REGISTER_MESSAGE'} />
                </div>
            );
        } else if (is_admin) {
            admin = (
                <div>
                  <NavItemTitle name="システム管理" />
                  <NavItem name="ユーザ"
                           onClick={this.onSelect('MANAGE_USERS')}
                           isSelected={selected === 'MANAGE_USERS'} />
                </div>
            );
        }


        /*
         * 以下、レンダリングする内容。
         * 長かった ...
         */
        return (
            <div id={this.state.nav_id}>
              {draft_order}
              <NavItemTitle name="経費精算申請" />
              <NavItem name="起案"
                       onClick={this.onSelect('APPLY_COST')}
                       isSelected={selected === 'APPLY_COST'} />
              <NavItem name="一覧"
                       onClick={this.onSelect('LIST_COSTS')}
                       isSelected={selected === 'LIST_COSTS'} />
              {budget}
              {admin}
              <NavItemTitle name="その他" />
              <NavItem name="パスワード変更"
                       onClick={this.onSelect('CHANGE_PASSWORD')}
                       isSelected={selected === 'CHANGE_PASSWORD'} />
              <NavItem name="ログアウト"
                       onClick={this.props.logout}
                       isSelected={selected === 'LOGOUT'}
                       bottom={true}  />
            </div>
        );
    }
});

module.exports = Nav;
