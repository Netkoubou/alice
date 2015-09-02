/*
 * 候補ペイン
 */
'use strict';
var React      = require('react');
var Fluxxor    = require('fluxxor');
var TableFrame = require('../components/TableFrame');

var CandidateName = React.createClass({
    mixins: [ Fluxxor.FluxMixin(React) ],

    propType: {
        candidate: React.PropTypes.shape({
            code:   React.PropTypes.string.isRequired,
            name:   React.PropTypes.string.isRequired,
            maker:  React.PropTypes.string.isRequired,
            trader: React.PropTypes.string.isRequired,
            price:  React.PropTypes.number.isRequired
        })
    },

    getInitialState: function() {
        return { is_clickable: false };
    },

    onMouseOver: function() {
        this.setState({ is_clickable: true });
    },

    onMouseLeave: function() {
        this.setState({ is_clickable: false });
    },

    onSelectCandidate: function() {
        var candidate = this.props.candidate;
        return this.getFlux().actions.addFinalist({ finalist: candidate });
    },

    render: function() {
        var className = '';
        
        if (this.state.is_clickable) {
            className = 'order-candidate-pane-clickable';
        }

        return (
            <div onClick={this.onSelectCandidate}
                 onMouseOver={this.onMouseOver}
                 onMouseLeave={this.onMouseLeave}
                 className={className}>
              {this.props.children}
            </div>
        );
    }
});

var CandidatePane = React.createClass({
    propTypes: { candidates: React.PropTypes.array.isRequired },

    render: function() {
        var title = [
            { name: '品名',   type: 'string' },
            { name: '製造者', type: 'string' },
            { name: '販売元', type: 'string' },
            { name: '単価',   type: 'number' }
        ];

        var data = this.props.candidates.map(function(candidate) {
            return [
                {
                    value: candidate.name,
                    view:  <CandidateName candidate={candidate}>
                             {candidate.name}
                           </CandidateName>
                },
                {
                    value: candidate.maker,
                    view:  <span>{candidate.maker}</span>
                },
                {
                    value: candidate.trader,
                    view:  <span>{candidate.trader}</span>
                },
                {
                    value: candidate.price,
                    view:  <span>{candidate.price}</span>
                }
            ];
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
