'use strict';
var React          = require('react');
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Popover        = require('react-bootstrap').Popover;
var XHR            = require('superagent');
var EditUser       = require('./EditUser');
var Select         = require('../components/Select');
var TableFrame     = require('../components/TableFrame');
var Messages       = require('../lib/Messages');

var ManageUsers = React.createClass({
    propTypes: { user: React.PropTypes.object.isRequired },

    getInitialState: function() {
        return {
            users:           [],
            departments:     [],
            department_code: '',
            next_ope:        null
        };
    },

    listUsers: function(department_code) {
        XHR.post('/listUsers').send({
            department_code: department_code
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.MANAGE_USERS_LIST_USERS);
                throw 'ajax_selectUsers';
            }

            if (res.body.status != 0) {
                alert(Messages.server.MANAGE_USERS_LIST_USERS);
                throw 'server_selectUsers';
            }

            this.setState({ users: res.body.users });
        }.bind(this) );
    },

    backToHere: function() {
        this.setState({ next_ope: null });
        this.listUsers(this.state.department_code);
    },

    onSelectDepartment: function(e) {
        this.setState({ department_code: e.code });
        this.listUsers(e.code);
    },

    onSelectUser: function(index) {
        var next_ope;
        var my_account     = this.props.user.account;
        var target_account = this.state.users[index].account;

        return function() {
            var next_ope = <EditUser target={this.state.users[index]}
                                     departments={this.state.departments}
                                     goBack={this.backToHere} />;

            this.setState({ next_ope: next_ope });
        }.bind(this);
    },

    onAddUser: function() {
        if (this.state.department_code === '') {
            alert('部門診療科を選択して下さい。');
            return;
        }

        this.setState({
            next_ope: <EditUser departments={this.state.departments}
                                goBack={this.backToHere} />
        });
    },

    onEraseUser: function(index) {
        return function() {
            var msg = 'アカウント "' + this.state.users[index].account + 
                      '" のユーザを削除します。\n よろしいですか?';
                      
            if (confirm(msg) ) {
                XHR.post('/eraseUser').send({
                    id:      this.state.users[index].id,    // 不要
                    account: this.state.users[index].account
                }).end(function(err, res) {
                    if (err) {
                        alert(Messages.ajax.MANAGE_USERS_ERASE_USER);
                        throw 'ajax_eraseUser';
                    }

                    if (res.body.status != 0) {
                        alert(Messages.server.MANAGE_USERS_ERASE_USER);
                        throw 'server_eraseUser';
                    }

                    alert('消去しました。');
                    this.listUsers(this.state.department_code);
                }.bind(this) );
            }
        }.bind(this);
    },

    componentDidMount: function() {
        XHR.get('/tellAvailableDepartments').set({
            'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT'
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.MANAGE_USERS_TELL_AVAILABLE_DEPARTMENTS);
                throw 'ajax_tellAllDepartments';
            }

            if (res.body.status != 0) {
                alert(Messages.server.MANAGE_USERS_TELL_AVAILABLE_DEPARTMENTS);
                throw 'server_tellAllDepartments';
            }

            if (res.body.departments.length == 1) {
                this.setState({
                    department_code: res.body.departments[0].code,
                    departments:     res.body.departments
                });

                this.listUsers(res.body.departments[0].code);
            } else {
                this.setState({ departments: res.body.departments });
            }
        }.bind(this) );
    },

    makeTableFrameTitle: function() {
        return [
            { name: '+/-',        type: 'void'   },
            { name: 'アカウント', type: 'string' },
            { name: '氏名',       type: 'string' },
            { name: 'E-Mail',     type: 'string' },
        ];
    },

    isOutsider: function(target) {
        if (this.props.user.privileged.administrate) {
            return false;
        }

        for (var i = 0; i < target.departments.length; i++) {
            var is_absent = this.props.user.departments.filter(function(d) {
                return d.code === target.departments[i].code;
            }).length == 0;

            if (is_absent) {
                return true;
            }
        }

        return false;
    },

    composeTableFrameData: function() {
        var data = this.state.users.map(function(u, i) {
            var eraser;
            var account;

            if (this.props.user.account != u.account && !this.isOutsider(u) ) {
                eraser = (
                    <div className="manage-users-remove-user"
                         onClick={this.onEraseUser(i)}>
                      -
                    </div>
                );

                account = (
                    <div className="manage-users-account"
                         onClick={this.onSelectUser(i)}>
                      {u.account}
                    </div>
                );
            } else {
                eraser  = '';

                var id      = "manage-users-popover" + i.toString();
                var popover = <Popover id={id}>
                                ご自分のユーザ情報、若しくは管轄外の部門
                                診療科に所属するユーザの情報を変更することは
                                できません。
                              </Popover>;

                account = (
                    <OverlayTrigger container={this.refs.manageUsers}
                                    placement="right"
                                    overlay={popover}>
                      <span className="manage-users-popover">
                        {u.account}
                      </span>
                    </OverlayTrigger>
                );
            }

            return [
                { value: '',        view: eraser },
                { value: u.account, view: account },
                { value: u.name,    view: u.name  },
                { value: u.email,   view: u.email }
            ];
        }.bind(this) );

        data.push([
            {
                value: '',
                view: <div className="manage-users-add-user"
                           onClick={this.onAddUser}>
                        +
                      </div>
            },
            { value: '', view: '' },
            { value: '', view: '' },
            { value: '', view: '' }
        ]);

        return data;
    },

    render: function() {
        if (this.state.next_ope != null) {
            return this.state.next_ope;
        }

        return (
            <div id="manage-users" ref="manageUsers">
              <div id="manage-users-select">
                <Select key="部門診療科"
                        placeholder="部門診療科"
                        value={this.state.department_code}
                        onSelect={this.onSelectDepartment}
                        options={this.state.departments} />
              </div>
              <TableFrame id="manage-users-list"
                          title={this.makeTableFrameTitle()}
                          data={this.composeTableFrameData()} />
            </div>
        );
    }
});

module.exports = ManageUsers;
