/*
 * 候補ペイン
 */
'use strict';
var React      = require('react');
var Fluxxor    = require('fluxxor');
var TableFrame = require('../components/TableFrame');

var CandidatePane = React.createClass({
    mixins:    [Fluxxor.FluxMixin(React)],
    propTypes: {
        candidates: React.PropTypes.arrayOf(React.PropTypes.shape({
            key: React.PropTypes.string,
            cells: React.PropTypes.array
        }) ).isRequired
    },

    render: function() {
        var title = [ '品名', '製造者', '販売元', '単価' ];

        return (
            <fieldset id="order-candidate-pane" className="order-pane">
              <legend>候補</legend>
              <TableFrame id="order-candidates"
                          title={title}
                          body={this.props.candidates} />
            </fieldset>
        );
    }
});

module.exports = CandidatePane;
