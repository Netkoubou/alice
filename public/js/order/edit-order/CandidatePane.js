/*
 * 候補ペイン
 */
'use strict';
var React      = require('react');
var Fluxxor    = require('fluxxor');
var TableFrame = require('../../components/TableFrame');


/*
 * 発注候補一覧の品名セル専用コンポーネント。
 * ここをクリックすることで、その物品が発注確定一覧に入る。
 */
var CandidateName = React.createClass({
    mixins:   [ Fluxxor.FluxMixin(React) ],
    propType: { candidate: React.PropTypes.object.isRequired },

    onSelectCandidate: function() {
        var candidate = this.props.candidate;
        return this.getFlux().actions.addFinalist({ candidate: candidate });
    },

    render: function() {
        return (
            <div className='candidate-pane-candidate-name'
                 onClick={this.onSelectCandidate}>
              {this.props.children}
            </div>
        );
    }
});

var CandidatePane = React.createClass({
    propTypes: {
        candidates: React.PropTypes.arrayOf(React.PropTypes.shape({
            product_code: React.PropTypes.string.isRequired,
            product_name: React.PropTypes.string.isRequired,
            maker:        React.PropTypes.string.isRequired,
            min_price:    React.PropTypes.number.isRequired,
            cur_price:    React.PropTypes.number.isRequired,
            max_price:    React.PropTypes.number.isRequired,
            trader_code:  React.PropTypes.string.isRequired,
            trader_name:  React.PropTypes.string.isRequired
        }) ).isRequired
    },

    makeTableFrameTitle: function() {
        return [
            { name: '品名',     type: 'string' },
            { name: '製造元',   type: 'string' },
            { name: '販売元',   type: 'string' },
            { name: '現在単価', type: 'number' },
        ];
    },

    composeTableFrameData: function() {
        /*
         * ここで、上位要素から貰った発注候補一覧用の生データを
         * TableFrame 用に変換する。
         */
        return this.props.candidates.map(function(candidate) {
            var min_price = candidate.min_price.toLocaleString('ja-JP', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });

            var cur_price = candidate.cur_price.toLocaleString('ja-JP', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });

            var max_price = candidate.max_price.toLocaleString('ja-JP', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });

            return [
                {
                    value: candidate.product_name,
                    view:  <CandidateName candidate={candidate}>
                             {candidate.product_name}
                           </CandidateName>
                },
                {
                    value: candidate.maker,
                    view:  <span>{candidate.maker}</span>
                },
                {
                    value: candidate.trader_name,
                    view:  <span>{candidate.trader_name}</span>
                },
                {
                    value: candidate.cur_price,
                    view:  <span>{cur_price}</span>
                },
            ];
        });
    },

    render: function() {
        var title = this.makeTableFrameTitle();
        var data  = this.composeTableFrameData();

        return (
            <fieldset id="candidate-pane" className="edit-order-pane">
              <legend>候補</legend>
              <TableFrame id="candidate-pane-candidates"
                          title={title} data={data} />
            </fieldset>
        );
    }
});

module.exports = CandidatePane;
