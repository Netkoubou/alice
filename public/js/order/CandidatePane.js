/*
 * 候補ペイン
 */

/*
 * 発注する商品の候補一覧を表で表示するペイン。
 * 商品の品名をクリックすると確定ペインに入る。
 */
'use strict';
var React      = require('react');
var Fluxxor    = require('fluxxor');
var TableFrame = require('../components/TableFrame');


/*
 * 候補一覧表の品名セル専用のコンポーネント。
 * ここをクリックすることで、その商品が確定ペインに入る。
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
            <div className='order-candidate-pane-name'
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
         * ここで、上位要素から貰った候補一覧の生データを
         * TableFrame 用に変換する。
         */
        var data = this.props.candidates.map(function(candidate) {
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
                    view:  <span>{candidate.price.toLocaleString()}</span>
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
