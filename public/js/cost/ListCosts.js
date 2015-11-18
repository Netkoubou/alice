'use strict';
var React          = require('react');
var Input          = require('react-bootstrap').Input;
var Button         = require('react-bootstrap').Button;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Popover        = require('react-bootstrap').Popover;
var XHR            = require('superagent');
var moment         = require('moment');
var TableFrame     = require('../components/TableFrame');
var CalendarMarker = require('../components/CalendarMarker');
var Messages       = require('../lib/Messages');
var Util           = require('../lib/Util');

var ListCosts = React.createClass({
    propTypes: { user: React.PropTypes.object.isRequired },

    getInitialState: function() {
        return {
            start_date:   moment(),
            end_date:     moment(),
            is_approving: false,
            is_approved:  false,
            is_rejected:  false,
            costs:        []
        };
    },

    onMark: function() {
    },

    onChangeCheckbox: function() {
    },

    render: function() {
        var title = [
            { name: '起案番号',          type: 'string' },
            { name: '起案日',            type: 'string' },
            { name: '起案者',            type: 'string' },
            { name: '申請元 部門診療科', type: 'string' },
            { name: '勘定科目',          type: 'string' },
            { name: '品目',              type: 'string' },
            { name: '総計',              type: 'number' },
            { name: '!',                 type: 'string' }
        ];

        return (
            <div id="list-costs" ref="listCosts">
              <fieldset id="list-costs-search">
                <legend>検索</legend>
                <div id="list-costs-calendar-marker">
                  <CalendarMarker startDate={this.state.start_date}
                                  endDate={this.state.end_date}
                                  onMark={this.onMark} />
                </div>
                <div className="list-costs-checkbox">
                  <Input type="checkbox"
                         label="承認待ち"
                         checked={this.state.is_approving}
                         onChange={this.onChangeCheckbox}
                         ref="approving" />
                </div>
                <div className="list-costs-checkbox">
                  <Input type="checkbox"
                         label="承認済み"
                         checked={this.state.is_approved}
                         onChange={this.onChangeCheckbox}
                         ref="approved" />
                </div>
                <div className="list-costs-checkbox">
                  <Input type="checkbox"
                         label="却下"
                         checked={this.state.is_rejected}
                         onChange={this.onChangeCheckbox}
                         ref="rejected" />
                </div>
                <div id="list-costs-buttons">
                  <Button bsSize="small" onClick={this.onSearch}>検索</Button>
                </div>
              </fieldset>
              <fieldset id="list-costs-table-fieldset">
                <legend>経費精算申請一覧</legend>
                <TableFrame id="list-costs-table"
                            title={title}
                            data={this.state.costs} />
              </fieldset>
            </div>
        );
    }
});

module.exports = ListCosts;
