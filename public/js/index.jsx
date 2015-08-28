var React  = require('react');
var Header = require('./Header');
var Nav    = require('./Nav');
var Ope    = require('./Ope');
var Footer = require('./Footer');


/*
 * 仮のユーザ情報。
 * 正しくは (きちんと実装が進めば) ログインページから (何らかの手段で)
 * 情報を受け取る。
 */
var user = {
    name:       '磯野 まぐろ',
    permission: 'privilige',
    medical:    true,
    urgency:    true,
    approval:   true
};

var Contents = React.createClass({
    /*
     * 状態として
     *
     *   action: これから何をしようとしているのか === 今何をしているのか
     *
     * を管理する。
     * 値は以下の文字列:
     * 
     *   - ORDINARY_ORDER: 通常発注
     *   - URGENTRY_ORDER: 緊急発注
     *   - MEDS_ORDER:     薬剤発注
     *   - ORDER_LIST:     発注一覧
     *   - COST_COUNT:     経費 / 精算
     *   - BUDGET_ADMIN:   予算管理
     *   - USER_ADMIN:     ユーザ管理
     *   - TRADER_ADMIN:   販売元管理
     *   - GOODS_ADMIN:    物品管理
     *   - PASSWD_CHANGE:  パスワード変更
     *   - LOGOUT:         ログアウト
     */
    getInitialState: function() {
        return ({
            action: null
        });
    },

    setAction: function(selected) {
        this.setState({ action: selected });
    },

    render: function() {
        return (
            <div>
              <Header username={user.name} />
              <div id="content">
                <Nav user={user} onSelect={this.setAction} />
                <Ope user={user} action={this.state.action} />
              </div>
              <Footer user={user} />
            </div>
        );
    }
});

React.render(<Contents />, document.body);
