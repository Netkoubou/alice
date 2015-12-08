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
        isMyself: React.PropTypes.bool,
        target:   React.PropTypes.shape({
            account:    React.PropTypes.string.isRequired,
            name:       React.PropTypes.string.isRequired,
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
        var post = {
            account:    '',
            name:       '',
            passphrase: '',
            email:      '',
            privileged: {
                administrate:     false,
                draft_ordinarily: false,
                draft_urgently:   false,
                process_order:    false,
                approve:          false
            },
            departments: []
        };


        /*
         * post.departments のそれぞれのフラグの、真であるものの個数。
         * 例えば post.department.administrate == 3 の場合、
         * post.departments の中で 3 個の administrate が真になっている
         * ことになる。
         * これらの値を各フラグの制御に用いる。
         *
         * 例えば、承認権限を持ったユーザは発注の起案がすることができない。
         * そこで、
         * 
         *   - post.privileged.approve (== true) 若しくは
         *   - post.department.approve > 0
         *
         * の場合、
         *
         *   - post.privileged.draft_ordinarily 及び
         *   - post.privileged.draft_urgently 及び
         *   - post.departments 内の draft_ordinarily 及び
         *   - post.departments 内の draft_urgently
         *
         * を真にできないようにする、ってな感じの制御に利用する。
         */
        var department = {
            administrate:     0,
            draft_ordinarily: 0,
            draft_urgently:   0,
            process_order:    0,
            approve:          0
        };


        /*
         * props は変更不可なので、その値をシコシコとコピーしているのだが、
         * もっと上手い手はないものか ...
         */
        if (this.props.target != null) {
            post.account = this.props.target.account;
            post.name    = this.props.target.name;
            post.email   = this.props.target.email;

            for (var p in this.props.target.privileged) {
                post.privileged[p] = this.props.target.privileged[p];
            }

            post.departments = this.props.target.departments.map(function(d) {
                var post_department = {};

                for (var p in d) {
                    post_department[p] = d[p];

                    if (d[p]) {
                        department[p]++;
                    }
                }

                return post_department;
            });
        }

        return {
            post:       post,
            department: department
        }
    },

    registerOrUpdateUser: function(action) {
        if (this.state.post.account === '') {
            alert('アカウントを入力して下さい。');
            this.refs.account.getInputDOMNode().focus();
            return;
        }

        if (this.state.post.name === '') {
            alert('氏名を入力して下さい。');
            this.refs.name.getInputDOMNode().focus();
            return;
        }


        /*
         * this.props.target == null とは即ち、新規にユーザを作成している
         * ことに他ならない。
         * その場合、暫定パスワードの作成は必須。
         *
         * 既存のユーザを編集している場合 (即ち this.props.target != null)、
         * 暫定パスワード欄が空と言うことは、そのユーザのパスワードを変更
         * しないことを意味する。
         * 暫定パスワードに文字列が入力されている場合、そのユーザのパスワー
         * ドはその文字列で上書きされる。
         */
        if (this.props.target == null && this.state.post.passphrase === '') {
            alert('暫定パスワードを入力して下さい。');
            this.refs.passphrase.getInputDOMNode().focus();
            return;
        }

        if (this.state.post.email === '') {
            alert('E-mail (メールアカウント) を入力して下さい。');
            this.refs.email.getInputDOMNode().focus();
            return;
        }

        if (this.state.post.departments.length == 0) {
            alert('所属する部門診療科を最低一つ設定して下さい。');
            return;
        }

        var eq = function(x, y) { return x.code === y.code };

        if (Util.hasDuplication(this.state.post.departments, eq) ) {
            alert('所属する部門診療科の中に同じ部門診療科が複数あります。');
            return;
        }

        var route = (action === 'REGISTER')? '/registerUser': '/updateUser';

        XHR.post(route).send(this.state.post).end(function(err, res) {
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

            if (this.props.isMyself) {
                alert('更新しました。できれば一度ログアウトして下さい。');
            } else {
                alert('完了しました。');
            }

            this.props.goBack();
        }.bind(this) );
    },

    onRegisterUser: function() { this.registerOrUpdateUser('REGISTER'); },

    onUpdateUser: function() {
        if (this.props.isMyself) {
            var msg = 'ご自分のユーザ情報を更新しようとしています。\n' +
                      'よろしいですか?';
            confirm(msg);
            alert('更新後、できれば一旦ログアウトして下さい。');
        }

        this.registerOrUpdateUser('UPDATE');
    },

    onChangeAccount: function() {
        this.state.post.account = this.refs.account.getValue();
        this.setState({ post: this.state.post });
    },

    onChangeName: function() {
        this.state.post.name = this.refs.name.getValue();
        this.setState({ post: this.state.post });
    },

    onChangePassphrase: function() {
        this.state.post.passphrase = this.refs.passphrase.getValue();
        this.setState({ post: this.state.post });
    },

    onChangeEmail: function() {
        this.state.post.email = this.refs.email.getValue();
        this.setState({ post: this.state.post });
    },

    changePrivileged: function(property) {
        var post = this.state.post;
        post.privileged[property] = !post.privileged[property];
        this.setState({ post: post });
    },

    onChangePrivilegedAdministrate: function() {
        this.changePrivileged('administrate');
    },

    onChangePrivilegedDraftOrdinarily: function() {
        this.changePrivileged('draft_ordinarily');
    },

    onChangePrivilegedDraftUrgently: function() {
        this.changePrivileged('draft_urgently');
    },

    onChangePrivilegedProcessOrder: function() {
        this.changePrivileged('process_order');
    },

    onChangePrivilegedApprove: function() {
        this.changePrivileged('approve');
    },

    onAddDepartment: function() {
        this.state.post.departments.push({
            code:             this.props.departments[0].code,
            administrate:     false,
            draft_ordinarily: false,
            draft_urgently:   false,
            process_order:    false,
            approve:          false
        });

        this.setState({ post: this.state.post });
    },

    onRemoveDepartment: function(index) {
        return function() {
            for (var p in this.state.post.departments[index]) {
                if (this.state.post.departments[index][p]) {
                    this.state.department[p]--;
                }
            }

            var head = this.state.post.departments.slice(0, index);
            var tail = this.state.post.departments.slice(index + 1);

            this.state.post.departments = head.concat(tail);
            this.setState({
                post:       this.state.post,
                department: this.state.department
            });
        }.bind(this);
    },

    onSelectDepartment: function(index) {
        return function(e) {
            this.state.post.departments[index].code = e.target.value;
            this.setState({ post: this.state.post });
        }.bind(this);
    },

    invertCheckbox: function(i, name) {
        var departments = this.state.post.departments;

        departments[i][name] = !departments[i][name];

        if (departments[i][name]) {
            this.state.department[name]++;
        } else {
            this.state.department[name]--;
        }

        this.setState({
            post:       this.state.post,
            department: this.state.department
        });
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
        var data = this.state.post.departments.map(function(d, i) {
            var disabled_administrate     = false;
            var disabled_draft_ordinarily = false;
            var disabled_draft_urgently   = false;
            var disabled_process_order    = false;
            var disabled_approve          = false;

            var privileged = this.state.post.privileged;

            if (privileged.administrate) {
                disabled_administrate = true;
            }

            if (privileged.draft_ordinarily) {
                disabled_draft_ordinarily = true;
            }

            if (privileged.draft_urgently) {
                disabled_draft_urgently = true;
            }

            if (privileged.approve || d.approve) {
                disabled_draft_ordinarily = true;
                disabled_draft_urgently   = true;
            }

            if (privileged.process_order) {
                disabled_process_order = true;
            }

            if (privileged.approve) {
                disabled_approve = true;
            }

            if (privileged.draft_ordinarily || d.draft_ordinarily) {
                disabled_approve = true;
            }

            if (privileged.draft_urgently || d.draft_urgently) {
                disabled_approve = true;
            }

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
                          disabled={disabled_administrate}
                          checked={d.administrate} />
                    )
                },
                {
                    value: '',
                    view: (
                        <input
                          type="checkbox"
                          onChange={this.onChangeDepartmentDraftOrdinarily(i)}
                          disabled={disabled_draft_ordinarily}
                          checked={d.draft_ordinarily} />
                    )
                },
                {
                    value: '',
                    view: (
                        <input
                          type="checkbox"
                          onChange={this.onChangeDepartmentDraftUrgently(i)}
                          disabled={disabled_draft_urgently}
                          checked={d.draft_urgently} />
                    )
                },
                {
                    value: '',
                    view: (
                        <input
                          type="checkbox"
                          onChange={this.onChangeDepartmentProcessOrder(i)}
                          disabled={disabled_process_order}
                          checked={d.process_order} />
                    )
                },
                {
                    value: '',
                    view: (
                        <input
                          type="checkbox"
                          onChange={this.onChangeDepartmentApprove(i)}
                          disabled={disabled_approve}
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
        var disabled_administrate     = false;
        var disabled_draft_ordinarily = false;
        var disabled_draft_urgently   = false;
        var disabled_process_order    = false;
        var disabled_approve          = false;

        var privileged = this.state.post.privileged;
        var department = this.state.department;

        if (department.administrate > 0) {
            disabled_administrate = true;
        }

        if (department.draft_ordinarily > 0) {
            disabled_draft_ordinarily = true;
        }

        if (department.draft_urgently > 0) {
            disabled_draft_urgently = true;
        }

        if (department.approve > 0 || privileged.approve) {
            disabled_draft_ordinarily = true;
            disabled_draft_urgently   = true;
        }

        if (department.process_order > 0) {
            disabled_process_order = true;
        }

        if (department.approve > 0) {
            disabled_approve = true;
        }

        if (department.draft_ordinarily > 0 || privileged.draft_ordinarily) {
            disabled_approve = true;
        }

        if (department.draft_urgently > 0 || privileged.draft_urgently) {
            disabled_approve = true;
        }

        return (
            <fieldset>
              <legend>全部門診療科に跨がる権限</legend>
              <div id="edit-user-checkboxes">
                <div className="edit-user-checkbox">
                  <Input type="checkbox"
                         label="システム管理"
                         checked={this.state.post.privileged.administrate}
                         disabled={disabled_administrate}
                         onChange={this.onChangePrivilegedAdministrate} />
                </div>
                <div className="edit-user-checkbox">
                  <Input type="checkbox"
                         label="通常発注起案"
                         checked={this.state.post.privileged.draft_ordinarily}
                         disabled={disabled_draft_ordinarily}
                         onChange={this.onChangePrivilegedDraftOrdinarily} />
                </div>
                <div className="edit-user-checkbox">
                  <Input type="checkbox"
                         label="緊急発注起案"
                         checked={this.state.post.privileged.draft_urgently}
                         disabled={disabled_draft_urgently}
                         onChange={this.onChangePrivilegedDraftUrgently} />
                </div>
                <div className="edit-user-checkbox">
                  <Input type="checkbox"
                         label="発注処理"
                         checked={this.state.post.privileged.process_order}
                         disabled={disabled_process_order}
                         onChange={this.onChangePrivilegedProcessOrder} />
                </div>
                <div className="edit-user-checkbox">
                  <Input type="checkbox"
                         label="承認"
                         checked={this.state.post.privileged.approve}
                         disabled={disabled_approve}
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
                         disabled={this.props.target != null}
                         value={this.state.post.account}
                         onChange={this.onChangeAccount}
                         placeholder="アカウント" />
                </div>
                <div id="edit-user-name">
                  <Input type="text"
                         bsSize="small"
                         maxLength="32"
                         ref="name"
                         value={this.state.post.name}
                         onChange={this.onChangeName}
                         placeholder="氏名" />
                </div>
                <div className="edit-user-input">
                  <Input type="text"
                         bsSize="small"
                         maxLength="32"
                         ref="passphrase"
                         value={this.state.post.passphrase}
                         onChange={this.onChangePassphrase}
                         placeholder="暫定パスワード"/>
                </div>
                <div id="edit-user-email">
                  <Input type="email"
                         bsSize="small"
                         ref="email"
                         value={this.state.post.email}
                         onChange={this.onChangeEmail}
                         placeholder="E-Mail" />
                </div>
              </div>
            </fieldset>
        );
    },

    render: function() {
        var title   = this.makeTableFrameTitle();
        var data    = this.composeTableFrameData();
        var buttons = [
            <Button key="0" bsSize="small" onClick={this.props.goBack}>
              戻る
            </Button>
        ];

        if (this.props.target == null) {
            buttons.push(
                <Button key="1" bsSize="small" onClick={this.onRegisterUser}>
                  追加
                </Button>
            );
        } else {
            buttons.push(
                <Button key="1" bsSize="small" onClick={this.onUpdateUser}>
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
              <div id="edit-user-buttons">{buttons}</div>
            </div>
        );
    }
});

module.exports = EditUser;
