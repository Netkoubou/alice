'use strict';
var React      = require('react');
var Button     = require('react-bootstrap').Button;
var XHR        = require('superagent');
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

    componentDidMount: function() {
        /*
        XHR.get('tellAllDepartments').end(function(err, res) {
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
        */
    },

    onSelectDepartment: function(e) {
        this.setState({ department_code: e.code });
    },

    onSearch: function(e) {
        if (this.state.department_code === '') {
            alert('部門診療科を選択して下さい。');
            e.preventDefault();
            return;
        }

        XHR.post('selectUsers').send({
            department_code: this.state.department_code
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

    onAddUser: function() {
        var next_ope = (
            <div>
            </div>
        );

        this.setState({ next_ope: next_ope });
    },

    backToHere: function() {
        this.setState({ next_ope: null });
        this.onSearch();
    },

    render: function() {
        if (this.state.next_ope != null) {
            return this.state.next_ope;
        }

        var title = [
            { name: '-',          type: 'void'   },
            { name: 'アカウント', type: 'string' },
            { name: '氏名',       type: 'string' },
            { name: '内線番号',   type: 'string' },
            { name: 'E-Mail',     type: 'string' },
        ];

        var data = this.state.users.map(function(u) {
            return [
                { view: '-',       value: '-'       },
                { view: u.account, value: u.account },
                { view: u.name,    value: u.name    },
                { view: u.tel,     value: u.tel     },
                { view: u.email,   value: u.email   }
            ];
        });

        return (
            <div id="manage-users">
              <Select key="部門診療科"
                      placeholder="部門診療科"
                      value={this.state.department_code}
                      onSelect={this.onSelectDepartment}
                      options={this.state.departments} />
              <TableFrame id="manage-users-list"
                          title={title}
                          data={data} />
              <Button bsSize="small" onClick={this.onAddUser}>
                追加
              </Button>
            </div>
        );
    }
});

module.exports = ManageUsers;
