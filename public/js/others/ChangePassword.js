'use strict';
var React  = require('react');
var Input  = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var XHR    = require('superagent');

var ChangePassword = React.createClass({
    changePassword: function() {
        var expiring       = this.refs.expiring.getValue();
        var fresh          = this.refs.fresh.getValue();
        var reconfirmation = this.refs.reconfirmation.getValue();

        if (fresh === reconfirmation) {
            XHR.post('changePassword').send({
                old: expiring,
                new: fresh
            }).end(function(err, res) {
                if (err) {
                    alert(Messages.ajax.CHANGE_PASSWORD_CHANGE_PASSWORD);
                    throw 'ajax_changePassword';
                }

                switch (res.body.status) {
                case 0:
                    alert('変更しました。');
                    break;
                case 1:
                    alert('パスワードが違います。');
                    break;
                default:
                    alert(Messages.server.CHANGE_PASSWORD_CHANGE_PASSWORD);
                    throw 'server_changePassword';
                }
            });
        } else {
            alert('確認用のパスワードが一致しません。');
        }
    },

    render: function() {
        return (
            <fieldset id="change-password">
              <Input type="password"
                     ref="expiring"
                     placeholder="旧パスワード" />
              <Input type="password"
                     ref="fresh"
                     placeholder="新パスワード" />
              <Input type="password"
                     ref="reconfirmation"
                     placeholder="新パスワード (確認用)" />
              <Button onClick={this.changePassword}>変更</Button>
            </fieldset>
        );
    }
});

module.exports = ChangePassword;
