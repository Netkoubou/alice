'use strict';
var React  = require('react');
var Input  = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var XHR    = require('superagent');

function is_secure(password, user) {
    var is_secure = true;

    if (password.length < 8) {
        is_secure = false;
    }

    if (password.match(/^\d+$/) ) {
        is_secure = false;
    }

    if (password.match(/^[a-z]+$/) ) {
        is_secure = false;
    }

    if (password.match(/^[A-Z]+$/) ) {
        is_secure = false;
    }

    if (password === user.account || password === user.name) {
        is_secure = false;
    }

    return is_secure;
}

var ChangePassword = React.createClass({
    propTypes: { user: React.PropTypes.object.isRequired },

    getInitialState: function() {
        return {
            expiring:       '',
            fresh:          '',
            reconfirmation: ''
        };
    },

    onChangeExpiring: function(e) {
        this.setState({ expiring: e.target.value });
    },

    onChangeFresh: function(e) {
        this.setState({ fresh: e.target.value });
    },

    onChangeReconfirmation: function(e) {
        this.setState({ reconfirmation: e.target.value });
    },

    changePassword: function() {
        if (this.state.expiring === this.state.fresh) {
            alert('旧パスワードと新パスワードが同じです。');
            this.setState({
                fresh:          '',
                reconfirmation: ''
            });
        } else if (!is_secure(this.state.fresh, this.props.user) ) {
            var msg = '新パスワードが安易です。\n' +
                      'Google や Yahoo!、Bing などのお告げを参考に、\n' +
                      '8 〜 32文字の推測され難く忘れ難い文字列を指定\n' +
                      'して下さい。';

            alert(msg);
            this.setState({
                fresh:          '',
                reconfirmation: ''
            });
        } else if (this.state.fresh === this.state.reconfirmation) {
            XHR.post('changePassword').send({
                old: this.state.expiring,
                new: this.state.fresh
            }).end(function(err, res) {
                if (err) {
                    alert(Messages.ajax.CHANGE_PASSWORD_CHANGE_PASSWORD);
                    throw 'ajax_changePassword';
                }

                switch (res.body.status) {
                case 0:
                    alert('変更しました。');
                    this.setState({
                        expiring:       '',
                        fresh:          '',
                        reconfirmation: ''
                    });

                    break;
                case 1:
                    alert('(旧) パスワードが違います。');
                    this.setState({ expiring: '' });
                    break;
                default:
                    alert(Messages.server.CHANGE_PASSWORD_CHANGE_PASSWORD);
                    throw 'server_changePassword';
                }
            }.bind(this) );
        } else {
            alert('確認用のパスワードが一致しません。');
            this.setState({
                fresh:          '',
                reconfirmation: ''
            });
        }
    },

    render: function() {
        return (
            <fieldset id="change-password">
              <Input type="password"
                     ref="expiring"
                     maxLength="32"
                     value={this.state.expiring}
                     onChange={this.onChangeExpiring}
                     placeholder="旧パスワード" />
              <Input type="password"
                     ref="fresh"
                     maxLength="32"
                     value={this.state.fresh}
                     onChange={this.onChangeFresh}
                     placeholder="新パスワード" />
              <Input type="password"
                     ref="reconfirmation"
                     maxLength="32"
                     value={this.state.reconfirmation}
                     onChange={this.onChangeReconfirmation}
                     placeholder="新パスワード (確認用)" />
              <Button onClick={this.changePassword}>変更</Button>
            </fieldset>
        );
    }
});

module.exports = ChangePassword;
