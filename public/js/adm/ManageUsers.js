'use strict';
var React      = require('react');
var XHR        = require('superagent');
var EditUser   = require('./EditUser');
var Select     = require('../components/Select');
var TableFrame = require('../components/TableFrame');
var Messages   = require('../lib/Messages');

var ManageUsers = React.createClass({
    getInitialState: function() {
        return {
            users:           [],
            departments:     [],
            department_code: '',
            next_ope:        null
        };
    },

    listUsers: function(department_code) {
        XHR.post('listUsers').send({
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
        this.listUsers(e.code);
    },

    onSelectDepartment: function(e) {
        this.setState({ department_code: e.code });
        this.listUsers(e.code);
    },

    onSelectUser: function(index) {
        return function() {
        };
    },

    onAddUser: function() {
        this.setState({
            next_ope: <EditUser departments={this.state.departments}
                                goBack={this.backToHere} />
        });
    },

    onRemove: function() {
    },

    componentDidMount: function() {
        XHR.get('tellAvailableDepartments').end(function(err, res) {
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
            { name: '内線番号',   type: 'string' },
            { name: 'E-Mail',     type: 'string' },
        ];
    },

    makeTableFrameData: function() {
        var data = this.state.users.map(function(u, i) {
            return [
                {
                    value: '',
                    view:  <div className="manage-users-remove-user"
                                onClick={this.props.onClick}>
                             -
                           </div>
                },
                { 
                    value: u.account,
                    view:  <div className="manage-users-account"
                                onClick={this.onSelectUser(i)}>
                             {u.account}
                           </div>
                },
                { value: u.name,    view: u.name    },
                { value: u.tel,     view: u.tel     },
                { value: u.email,   view: u.email   }
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
            { value: '', view: '' },
            { value: '', view: '' }
        ]);

        return data;
    },

    render: function() {
        if (this.state.next_ope != null) {
            return this.state.next_ope;
        }

        var title = this.makeTableFrameTitle();
        var data  = this.makeTableFrameData();

        return (
            <div id="manage-users">
              <div id="manage-users-select">
                <Select key="部門診療科"
                        placeholder="部門診療科"
                        value={this.state.department_code}
                        onSelect={this.onSelectDepartment}
                        options={this.state.departments} />
              </div>
              <TableFrame id="manage-users-list"
                          title={title}
                          data={data} />
            </div>
        );
    }
});

module.exports = ManageUsers;
