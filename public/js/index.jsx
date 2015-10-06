'use strict';

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
    account:    'm-perry',
    is_privileged: false,
    is_admin:      false,
    is_medical:    false,
    is_urgency:    false,
    is_approval:   false
};

var Page = React.createClass({
    /*
     * 状態として
     *
     *   action: これから何をしようとしているのか === 今何をしているのか
     *
     * を管理する。
     * 値は Nav.js を参照。
     */
    getInitialState: function() {
        return ({
            action: 'NONE'
        });
    },

    setAction: function(selected) {
        this.setState({ action: selected });
    },


    /*
     * ページの構成は以下
     *
     *   - ヘッダ (Header): 本ページのロゴ表示
     *   - コンテンツ領域 (content)
     *     + ナビゲーションバー (Nav)
     *     + 操作領域 (Ope)
     *   - フッタ (Footer): メッセージ表示エリア
     */
    render: function() {
        return (
            <div>
              <Header account={user.account} />
              <div id="content">
                <Nav user={user}
                     onSelect={this.setAction}
                     selected={this.state.action} />
                <Ope user={user} action={this.state.action} />
              </div>
              <Footer user={user} />
            </div>
        );
    }
});

React.render(<Page />, document.body);
