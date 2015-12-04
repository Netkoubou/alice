'use strict';
var React      = require('react');
var ReactDOM   = require('react-dom');
var Input      = require('react-bootstrap').Input;
var Button     = require('react-bootstrap').Button;
var XHR        = require('superagent');
var Messages   = require('../lib/Messages');
var Util       = require('../lib/Util');
var TableFrame = require('../components/TableFrame');

var SelectDepartment = React.createClass({
    propTypes: {
        options: React.PropTypes.arrayOf(React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        }) ).isRequired,

        initialSelected: React.PropTypes.string.isRequired,
        onSelect:        React.PropTypes.func.isRequired
    },

    render: function() {
        var options = this.props.options.map(function(o, i) {
            return (
                <TableFrame.Option key={i} value={o.code}>
                  {o.name}
                </TableFrame.Option>
            );
        });

        return (
            <TableFrame.Select initialSelected={this.props.initialSelected}
                               onSelect={this.props.onSelect}>
              {options}
            </TableFrame.Select>
        );
    }
});

var EditUser = React.createClass({
    propTypes: {
        user: React.PropTypes.shape({
            account:    React.PropTypes.string.isRequired,
            name:       React.PropTypes.string.isRequired,
            tel:        React.PropTypes.string.isRequired,
            email:      React.PropTypes.string.isRequired,
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
        }),

        departments: React.PropTypes.arrayOf(React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        }) ).isRequired,

        goBack:  React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        var account    = '';
        var name       = '';
        var passphrase = '';
        var tel        = '';
        var email      = '';

        var privileged_administrate     = false;
        var privileged_draft_ordinarily = false;
        var privileged_draft_urgently   = false;
        var privileged_process_order    = false;
        var privileged_approve          = false;

        var departments = [];


        /*
         * props は変更不可なので、その値をシコシコとコピーしているのだが、
         * もっと上手い手はないものか ...
         */
        if (this.props.user != null) {
            var user = this.props.user;

            account    = user.account;
            name       = user.name;
            tel        = user.tel;
            email      = user.email;

            privileged_administrate     = user.privileged.administrate;
            privileged_draft_ordinarily = user.privileged.draft_ordinarily;
            privileged_draft_urgently   = user.privileged.draft_urgently;
            privileged_process_order    = user.privileged.process_order;
            privileged_approve          = user.privileged.approve;

            departments = user.departments.map(function(d) {
                return {
                    code:             d.code,
                    administrate:     d.administrate,
                    draft_ordinarily: d.draft_ordinarily,
                    draft_urgently:   d.draft_urgently,
                    process_order:    d.process_order,
                    approve:          d.approve
                };
            });
        }

        return {
            account:     account,
            name:        name,
            passphrase:  passphrase,
            tel:         tel,
            email:       email,

            privileged_administrate:     privileged_administrate,
            privileged_draft_ordinarily: privileged_draft_ordinarily,
            privileged_draft_urgently:   privileged_draft_urgently,
            privileged_process_order:    privileged_process_order,
            privileged_approve:          privileged_approve,

            departments: departments
        }
    },

    registerOrUpdateUser: function(action) {
        var post  = {
            account:    this.state.account,
            name:       this.state.name,
            passphrase: this.state.passphrase,
            tel:        this.state.tel,
            email:      this.state.email,
            privileged: {
                administrate:     this.state.privileged_administrate,
                draft_ordinarily: this.state.privileged_draft_ordinarily,
                draft_urgently:   this.state.privileged_draft_urgently,
                process_order:    this.state.privileged_process_order,
                approve:          this.state.privileged_approve
            },
            departments: this.state.departments
        };

        if (post.account === '') {
            alert('アカウントを入力して下さい。');
            this.refs.account.getInputDOMNode().focus();
            return;
        }

        if (post.name === '') {
            alert('氏名を入力して下さい。');
            this.refs.name.getInputDOMNode().focus();
            return;
        }

        if (this.props.user == null && post.passphrase === '') {
            alert('暫定パスワードを入力して下さい。');
            this.refs.passphrase.getInputDOMNode().focus();
            return;
        }

        if (post.tel === '') {
            alert('内線番号を入力して下さい。');
            this.refs.tel.getInputDOMNode().focus();
            return;
        }

        if (post.email === '') {
            alert('E-mail (メールアカウント) を入力して下さい。');
            this.refs.email.getInputDOMNode().focus();
            return;
        }

        if (post.departments.length == 0) {
            alert('所属する部門診療科を最低一つ設定して下さい。');
            return;
        }

        var eq = function(x, y) { return x.code === y.code };

        if (Util.hasDuplication(this.state.departments, eq) ) {
            alert('所属する部門診療科の中に同じ部門診療科が複数あります。');
            return;
        }

        var route = (action === 'REGISTER')? '/registerUser': '/updateUser';

        XHR.post(route).send(post).end(function(err, res) {
            if (err) {
                if (action === 'REGISTER') {
                    alert(Messages.ajax.EDIT_USER_REGISTER_USER);
                    throw 'ajax_addOUser';
                }

                alert(Messages.ajax.EDIT_USER_UPDATE_USER);
                throw 'ajax_updateOUser';
            }

            if (res.body.status > 1) {
                if (action === 'REGISTER') {
                    alert(Messages.server.EDIT_USER_REGISTER_USER);
                    throw 'server_addOUser';
                }

                alert(Messages.server.EDIT_USER_UPDATE_USER);
                throw 'server_updateOUser';
            }

            if (res.body.status == 1) {
                alert('アカウントが他のユーザと重複しています。');
                ReactDOM.findDOMNode(this.refs.account).focus();
                return;
            }

            alert('完了しました。');
            this.props.goBack();
        }.bind(this) );
    },

    onRegisterUser: function() { this.registerOrUpdateUser('REGISTER'); },
    onUpdateUser:   function() { this.registerOrUpdateUser('UPDATE'); },

    onChangeAccount: function() {
        this.setState({ account: this.refs.account.getValue() });
    },

    onChangeName: function() {
        this.setState({ name: this.refs.name.getValue() });
    },

    onChangePassphrase: function() {
        this.setState({ passphrase: this.refs.passphrase.getValue() });
    },

    onChangeTel: function() {
        this.setState({ tel: this.refs.tel.getValue() });
    },

    onChangeEmail: function() {
        this.setState({ email: this.refs.email.getValue() });
    },

    onChangePrivilegedAdministrate: function() {
        var value = !this.state.privileged_administrate;
        this.setState({ privileged_administrate: value });
    },

    onChangePrivilegedDraftOrdinarily: function() {
        var value = !this.state.privileged_draft_ordinarily;
        this.setState({ privileged_draft_ordinarily: value });
    },

    onChangePrivilegedDraftUrgently: function() {
        var value = !this.state.privileged_draft_urgently;
        this.setState({ privileged_draft_urgently: value });
    },

    onChangePrivilegedProcessOrder: function() {
        var value = !this.state.privileged_process_order;
        this.setState({ privileged_process_order: value });
    },

    onChangePrivilegedApprove: function() {
        var value = !this.state.privileged_approve;
        this.setState({ privileged_approve: value });
    },

    onAddDepartment: function() {
        this.state.departments.push({
            code:             this.props.departments[0].code,
            administrate:     false,
            draft_ordinarily: false,
            draft_urgently:   false,
            process_order:    false,
            approve:          false
        });

        this.setState({ departments: this.state.departments });
    },

    onRemoveDepartment: function(index) {
        return function() {
            var a = this.state.departments;

            this.setState({
                departments: a.slice(0, index).concat(a.slice(index + 1) )
            });
        }.bind(this);
    },

    onSelectDepartment: function(index) {
        return function(e) {
            this.state.departments[index].code = e.target.value;
            this.setState({ departments: this.state.departments });
        }.bind(this);
    },

    invertCheckbox: function(i, name) {
        this.state.departments[i][name] = !this.state.departments[i][name];
        this.setState({ departments: this.state.departments });
    },

    onChangeDepartmentAdministrate: function(i) {
        return function() {
            this.invertCheckbox(i, 'administrate');
        }.bind(this);
    },

    onChangeDepartmentDraftOrdinarily: function(i) {
        return function() {
            this.invertCheckbox(i, 'draft_ordinarily');
        }.bind(this);
    },

    onChangeDepartmentDraftUrgently: function(i) {
        return function() {
            this.invertCheckbox(i, 'draft_urgently');
        }.bind(this);
    },

    onChangeDepartmentProcessOrder: function(i) {
        return function() {
            this.invertCheckbox(i, 'process_order')
        }.bind(this);
    },

    onChangeDepartmentApprove: function(i) {
        return function() {
            this.invertCheckbox(i, 'approve')
        }.bind(this);
    },

    makeTableFrameTitle: function() {
        return [
            { name: '+/-',             type: 'void' },
            { name: '所属 部門診療科', type: 'string' },
            { name: 'システム管理',    type: 'void' },
            { name: '通常発注起案',    type: 'void' },
            { name: '緊急発注起案',    type: 'void' },
            { name: '発注処理',        type: 'void' },
            { name: '承認',            type: 'void' },
        ];
    },

    composeTableFrameData: function() {
        var data = this.state.departments.map(function(d, i) {
            return [
                {
                    value: '-',
                    view:  <div className="edit-user-remove-department"
                                onClick={this.onRemoveDepartment(i)}>
                             -
                           </div>
                },
                {
                    value: d.code,
                    view:  <SelectDepartment
                             options={this.props.departments}
                             initialSelected={d.code}
                             onSelect={this.onSelectDepartment(i)} />
                },
                {
                    value: '',
                    view: (
                        <input
                          type="checkbox"
                          onChange={this.onChangeDepartmentAdministrate(i)}
                          checked={d.administrate} />
                    )
                },
                {
                    value: '',
                    view: (
                        <input
                          type="checkbox"
                          onChange={this.onChangeDepartmentDraftOrdinarily(i)}
                          checked={d.draft_ordinarily} />
                    )
                },
                {
                    value: '',
                    view: (
                        <input
                          type="checkbox"
                          onChange={this.onChangeDepartmentDraftUrgently(i)}
                          checked={d.draft_urgently} />
                    )
                },
                {
                    value: '',
                    view: (
                        <input
                          type="checkbox"
                          onChange={this.onChangeDepartmentProcessOrder(i)}
                          checked={d.process_order} />
                    )
                },
                {
                    value: '',
                    view: (
                        <input
                          type="checkbox"
                          onChange={this.onChangeDepartmentApprove(i)}
                          checked={d.approve} />
                    )
                }
            ];
        }.bind(this) );

        data.push([
            {
                value: '+',
                view: <div className="edit-user-add-department"
                           onClick={this.onAddDepartment}>
                        +
                      </div>
            },
            { value: '', view: '' },
            { value: '', view: '' },
            { value: '', view: '' },
            { value: '', view: '' },
            { value: '', view: '' },
            { value: '', view: '' }
        ]);

        return data;
    },


    /*
     * 本当は component として定義したかったのだけれど、
     * ref を使っているため、断念。
     * メソッドで代用することに。
     */
    generatePrivilegedPermissions: function() {
        return (
            <fieldset>
              <legend>全部門診療科に跨がる権限</legend>
              <div id="edit-user-checkboxes">
                <div className="edit-user-checkbox">
                  <Input type="checkbox"
                         label="システム管理"
                         checked={this.state.privileged_administrate}
                         onChange={this.onChangePrivilegedAdministrate} />
                </div>
                <div className="edit-user-checkbox">
                  <Input type="checkbox"
                         label="通常発注起案"
                         checked={this.state.privileged_draft_ordinarily}
                         onChange={this.onChangePrivilegedDraftOrdinarily} />
                </div>
                <div className="edit-user-checkbox">
                  <Input type="checkbox"
                         label="緊急発注起案"
                         checked={this.state.privileged_draft_urgently}
                         onChange={this.onChangePrivilegedDraftUrgently} />
                </div>
                <div className="edit-user-checkbox">
                  <Input type="checkbox"
                         label="発注処理"
                         checked={this.state.privileged_process_order}
                         onChange={this.onChangePrivilegedProcessOrder} />
                </div>
                <div className="edit-user-checkbox">
                  <Input type="checkbox"
                         label="承認"
                         checked={this.state.privileged_approve}
                         onChange={this.onChangePrivilegedApprove} />
                </div>
              </div>
            </fieldset>
        );
    },

    generateBasicInfos: function() {
        return (
            <fieldset>
              <legend>基本情報</legend>
              <div id="edit-user-inputs">
                <div className="edit-user-input">
                  <Input type="text"
                         bsSize="small"
                         maxLength="32"
                         ref="account"
                         disabled={this.props.user != null}
                         value={this.state.account}
                         onChange={this.onChangeAccount}
                         placeholder="アカウント" />
                </div>
                <div id="edit-user-name">
                  <Input type="text"
                         bsSize="small"
                         maxLength="32"
                         ref="name"
                         value={this.state.name}
                         onChange={this.onChangeName}
                         placeholder="氏名" />
                </div>
                <div className="edit-user-input">
                  <Input type="text"
                         bsSize="small"
                         maxLength="32"
                         ref="passphrase"
                         value={this.state.passphrase}
                         onChange={this.onChangePassphrase}
                         placeholder="暫定パスワード"/>
                </div>
                <div id="edit-user-tel">
                  <Input type="text"
                         bsSize="small"
                         maxLength="8"
                         ref="tel"
                         value={this.state.tel}
                         onChange={this.onChangeTel}
                         placeholder="内線番号" />
                </div>
                <div id="edit-user-email">
                  <Input type="email"
                         bsSize="small"
                         ref="email"
                         value={this.state.email}
                         onChange={this.onChangeEmail}
                         placeholder="E-Mail" />
                </div>
              </div>
            </fieldset>
        );
    },

    render: function() {
        var title  = this.makeTableFrameTitle();
        var data   = this.composeTableFrameData();
        var button;

        if (this.props.user == null) {
            button = (
                <Button bsSize="small" onClick={this.onRegisterUser}>
                  追加
                </Button>
            );
        } else {
            button = (
                <Button bsSize="small" onClick={this.onUpdateUser}>
                  更新
                </Button>
            );
        }

        return (
            <div id="edit-user">
              {this.generateBasicInfos()}
              {this.generatePrivilegedPermissions()}
              <fieldset id="edit-user-table-frame">
                <legend>所属する部門診療科とそれに対する権限</legend>
                <TableFrame id="edit-user-departments"
                            title={title}
                            data={data} />
              </fieldset>
              <div id="edit-user-buttons">{button}</div>
            </div>
        );
    }
});

module.exports = EditUser;
