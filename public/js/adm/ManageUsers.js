'use strict';
var React      = require('react');
var XHR        = require('superagent');
var Select     = require('../components/Select');
var TableFrame = require('../components/TableFrame');
var Messages   = require('../lib/Messages');

var AddUser = React.createClass({
    propTypes: { onClick: React.PropTypes.func.isRequired },

    render: function() {
        return (
            <div className="manage-users-add-user"
                 onClick={this.props.onClick}>
              +
            </div>
        );
    }
});

var RemoveUser = React.createClass({
    propTypes: { onClick: React.PropTypes.func.isRequired },

    render: function() {
        return (
            <div className="manage-user-remove-user"
                 onClick={this.props.onClick}>
              -
            </div>
        );
    }
});

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
                alert(Messages.ajax.MANAGE_USERS_SELECT_USERS);
                throw 'ajax_selectUsers';
            }

            if (res.body.status != 0) {
                alert(Messages.server.MANAGE_USERS_SELECT_USERS);
                throw 'server_selectUsers';
            }

            this.setState({ users: res.body.users });
        }.bind(this) );
    },

    backToHere: function() {
        this.setState({ next_ope: null });
        listUsers(e.code);
    },

    onSelectDepartment: function(e) {
        this.setState({ department_code: e.code });
        listUsers(e.code);
    },

    onSelectUser: function(index) {
        return function() {
        };
    },

    onAdd: function() {
        return (
            <div></div>
        );
    },

    onRemove: function() {
    },

    componentDidMount: function() {
        XHR.get('tellAvailableDepartments').end(function(err, res) {
            if (err) {
                alert(Messages.ajax.MANAGE_USERS_TELL_ALL_DEPARTMENTS);
                throw 'ajax_tellAllDepartments';
            }

            if (res.body.status != 0) {
                alert(Messages.server.MANAGE_USERS_TELL_ALL_DEPARTMENTS);
                throw 'server_tellAllDepartments';
            }
                
            this.setState({ departments: res.body.departments });
        }.bind(this) );
    },

    render: function() {
        if (this.state.next_ope != null) {
            return this.state.next_ope;
        }

        var title = [
            { name: '+/-',        type: 'void'   },
            { name: 'アカウント', type: 'string' },
            { name: '氏名',       type: 'string' },
            { name: '内線番号',   type: 'string' },
            { name: 'E-Mail',     type: 'string' },
        ];

        var data = this.state.users.map(function(u, i) {
            return [
                {
                    value: '',
                    view:  <RemoveUser onClick={this.onRemove} />
                },
                { 
                    value: u.account,
                    view:  <div id="manage-users-account"
                                onClick={this.onSelectUser(i)}>
                             u.account
                           </div>
                },
                { value: u.name,    view: u.name    },
                { value: u.tel,     view: u.tel     },
                { value: u.email,   view: u.email   }
            ];
        });

        data.push([
            { value: '', view: <AddUser onClick={this.onAdd} /> },
            { value: '', view: '' },
            { value: '', view: '' },
            { value: '', view: '' },
            { value: '', view: '' }
        ]);

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
