'use strict';
var React      = require('react');
var Select     = require('../components/Select');
var TableFrame = require('../components/TableFrame');

var ManageOthers = React.createClass({
    getInitialState: function() {
        return {
            target_code: '',
            table_data:  []
        };
    },

    onSelectTarget: function(e) { this.setState({ target_code: e.code }); },

    composeTableDataOfDepartments: function() {
        var data = this.state.table_data.map(function(d) {
            return [
                {
                    value: '-',
                    view:  <div>
                           </div>
                },
                {
                    value: d.name,
                    view: <TableFrame.Input />
                },
                {
                    value: d.abbr, 
                    view:  <TableFrame.Input />
                },
                {
                    value: d.tel,
                    view:  <TableFrame.Input />
                }

            ];
        }.bind(this) );

        data.push([
            {
                value: '+',
                view:  <div>
                       </div>
            },
            { value: '', view: '' },
            { value: '', view: '' },
            { value: '', view: '' }
        ]);

        return data;
    },

    composeTableDataOfCategories: function() {
        var data = this.state.table_data.map(function(c) {
            return [
                {
                    value: '-',
                    view:  <div>
                           </div>
                },
                {
                    value: c.name,
                    view:  <TableFrame.Input />
                }
            ];
        }.bind(this) );

        data.push([
            {
                value: '+',
                view:  <div>
                       </div>
            },
            { value: '', view: '' }
        ]);

        return data;
    },

    composeTableDataOfTraders: function() {
        var data = this.state.table_data.map(function(t) {
            return [
                {
                    value: '-',
                    view:  <div>
                           </div>
                },
                {
                    value: t.name,
                    view:  <TableFrame.Input />
                },
                {
                    value: t.tel,
                    view:  <TableFrame.Input />
                },
                {
                    value: t.fax,
                    view:  <TableFrame.Input />
                },
                {
                    value: t.email,
                    view:  <TableFrame.Input />
                },
                {
                    value: t.communication,
                    view: <TableFrame.Select />
                }
            ];
        }.bind(this) );

        data.push([
            {
                value: '+',
                view:  <div>
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
        var targets = [
            { code: 'DEPARTMENTS', name: '部門診療科' },
            { code: 'CATEGORIES',  name: '品目' },
            { code: 'TRADERS',     name: '販売元' }
        ];

        var table_title;
        var table_data;
        var table;

        switch (this.state.target_code) {
        case 'DEPARTMENTS':
            table_title = [
                { name: '+/-',  type: 'void'   },
                { name: '名前', type: 'string' },
                { name: '略称', type: 'string' },
                { name: 'TEL',  type: 'string' }
            ];

            table = (
                <TableFrame id="manage-others-departments"
                            className="manage-others-table"
                            title={table_title}
                            data={table_data} />
            );
            break;
        case 'CATEGORIES':
            table_title = [
                { name: '+/-',  type: 'void'   },
                { name: '名前', type: 'string' }
            ];

            table       = (
                <TableFrame id="manage-others-categories"
                            className="manage-others-table"
                            title={table_title}
                            data={table_data} />
            );
            break;
        case 'TRADERS':
            table_title = [
                { name: '+/-',      type: 'void'   },
                { name: '名前',     type: 'string' },
                { name: 'TEL',      type: 'string' },
                { name: 'FAX',      type: 'string' },
                { name: 'E-Mail',   type: 'string' },
                { name: '発注方法', type: 'string' }
            ];

            table = (
                <TableFrame id="manage-others-traders"
                            className="manage-others-table"
                            title={table_title}
                            data={table_data} />
            );
            break;
        default:
            table = null;
        }

        return (
            <div id="manage-others">
              <div id="manage-others-select-target">
                <Select key="管理対象"
                        placeholder="管理対象を選んで下さい"
                        value={this.state.target_code}
                        onSelect={this.onSelectTarget}
                        options={targets} />
              </div>
              {table}
            </div>
        );
    }
});

module.exports = ManageOthers;
