'use strict';

var React    = require('react');
var Input    = require('react-bootstrap').Input;
var Button   = require('react-bootstrap').Button;
var XHR      = require('superagent');
var Header   = require('./Header');
var Nav      = require('./Nav');
var Ope      = require('./Ope');
var Footer   = require('./Footer');
var Messages = require('./lib/Messages');


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
            user:   null,
            action: 'NONE'
        });
    },

    setAction: function(selected) {
        this.setState({ action: selected });
    },

    login: function() {
        var account    = this.refs.account.getValue();
        var passphrase = this.refs.passphrase.getValue();

        XHR.post('authenticateUser').send({
            account: account,
            passphrase: passphrase
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.INDEX_AUTHENTICATE_USER);
                throw 'ajax_authenticateUser';
            }

            switch (res.body.status) {
            case 0:
                this.setState({ user: res.body.user });
                break;
            case 1:
                alert('アカウントとパスワードが一致しません。');
                break;
            default:
                alert(Messages.server.INDEX_AUTHENTICATE_USER);
                throw 'server_authenticateUser';
            }
        }.bind(this) );

    },

    logout: function() {
        if (confirm('ログアウトしますか?') ) {
            XHR.get('logout').end(function(err, res) {
                if (err) {
                    alert(Messages.ajax.INDEX_LOGOUT);
                    throw 'ajax_logout';
                }

                if (res.body.status != 0) {
                    alert(Messages.server.INDEX_LOGOUT);
                    throw 'server_logout';
                }

                this.setState({ user: null });
            }.bind(this) );
        }
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
        if (this.state.user === null) {
            return (
                <fieldset id="login">
                  <Input type="text" 
                         ref="account"
                         placeholder="アカウント" />
                  <Input type="password"
                         ref="passphrase"
                         placeholder="パスワード" />
                  <Button onClick={this.login}>ログイン</Button>
                </fieldset>
            );
        }

        return (
            <div>
              <Header account={user.account} />
              <div id="content">
                <Nav user={user}
                     onSelect={this.setAction}
                     logout={this.logout}
                     selected={this.state.action} />
                <Ope user={user} action={this.state.action} />
              </div>
              <Footer user={user} />
            </div>
        );
    }
});

React.render(<Page />, document.body);
