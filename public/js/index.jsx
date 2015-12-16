'use strict';
var React    = require('react');
var ReactDOM = require('react-dom');
var Input    = require('react-bootstrap').Input;
var Button   = require('react-bootstrap').Button;
var XHR      = require('superagent');
var Header   = require('./Header');
var Nav      = require('./Nav');
var Ope      = require('./Ope');
var Footer   = require('./Footer');
var Messages = require('./lib/Messages');

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
            account:    account,
            passphrase: passphrase
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.INDEX_AUTHENTICATE_USER);
                throw 'ajax_authenticateUser';
            }

            switch (res.body.status) {
            case 0:
                this.state.user         = res.body.user;
                this.state.user.account = account;
                this.setState({ user: this.state.user });
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
            XHR.get('logout').set({
                'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT'
            }).end(function(err, res) {
                if (err) {
                    alert(Messages.ajax.INDEX_LOGOUT);
                    throw 'ajax_logout';
                }

                if (res.body.status != 0) {
                    alert(Messages.server.INDEX_LOGOUT);
                    throw 'server_logout';
                }

                this.setState({ user: null, action: 'NONE' });
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
                <div>
                  <div id="header">
                    <img id="header-logo" src="img/logo.png" />
                    <div id="header-systitle">
                      <div id="header-sysname">次世代物品調達システム</div>
                      <span id="header-subsysname">
                        Supply Processing & Distribution
                      </span>
                    </div>
                    <div id="header-petname">Perry</div>
                  </div>
                  <fieldset id="login">
                    <Input type="text" 
                           ref="account"
                           maxLength="32"
                           placeholder="アカウント" />
                    <Input type="password"
                           ref="passphrase"
                           maxLength="32"
                           placeholder="パスワード" />
                    <Button bsStyle="primary"
                            bsSize="large"
                            onClick={this.login}>ログイン</Button>
                  </fieldset>
                </div>
            );
        }

        return (
            <div>
              <Header user={this.state.user} />
              <div id="content">
                <Nav user={this.state.user}
                     onSelect={this.setAction}
                     logout={this.logout}
                     selected={this.state.action} />
                <Ope user={this.state.user} action={this.state.action} />
              </div>
              <Footer />
            </div>
        );
    }
});

ReactDOM.render(<Page />, document.getElementById('contents-area') );
