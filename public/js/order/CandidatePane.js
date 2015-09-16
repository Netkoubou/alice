/*
 * 候補ペイン
 */
'use strict';
var React      = require('react');
var Fluxxor    = require('fluxxor');
var TableFrame = require('../components/TableFrame');


/*
 * 発注候補一覧の品名セル専用コンポーネント。
 * ここをクリックすることで、その物品が発注確定一覧に入る。
 */
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

    onSelectCandidate: function() {
        var candidate = this.props.candidate;
        return this.getFlux().actions.addFinalist({ candidate: candidate });
    },

    render: function() {
        return (
            <div className='order-candidate-name'
                 onClick={this.onSelectCandidate}>
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
            { name: 'メーカ', type: 'string' },
            { name: '販売元', type: 'string' },
            { name: '単価',   type: 'number' }
        ];


        /*
         * ここで、上位要素から貰った発注候補一覧用の生データを
         * TableFrame 用に変換する。
         */

        var data  = this.props.candidates.map(function(candidate) {
            var price_string = candidate.price.toLocaleString('ja-JP', {
                minimumFractionDigits: 2
            });

            return [
                {
                    value: candidate.goods.name,
                    view:  <CandidateName candidate={candidate}>
                             {candidate.goods.name}
                           </CandidateName>
                },
                {
                    value: candidate.maker,
                    view:  <span>{candidate.maker}</span>
                },
                {
                    value: candidate.trader.name,
                    view:  <span>{candidate.trader.name}</span>
                },
                {
                    value: candidate.price,
                    view:  <span>{price_string}</span>
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
