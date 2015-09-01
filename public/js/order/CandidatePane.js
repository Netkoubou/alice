/*
 * 候補ペイン
 */
'use strict';
var React      = require('react');
var TableFrame = require('../components/TableFrame');

var CandidatePane = React.createClass({
    propTypes: { candidates: React.PropTypes.array.isRequired },

    render: function() {
        var title = [
            { name: '品名',   type: 'string' },
            { name: '製造者', type: 'string' },
            { name: '販売元', type: 'string' },
            { name: '単価',   type: 'number' }
        ];

        var data = this.props.candidates.map(function(row) {
            return row.map(function(cell) {
                return { value: cell, view: <div>{cell}</div> };
            });
        });

        return (
            <fieldset id="order-candidate-pane" className="order-pane">
              <legend>候補</legend>
              <TableFrame id="order-candidates" title={title} data={data} />
            </fieldset>
        );
    }
});

module.exports = CandidatePane;
