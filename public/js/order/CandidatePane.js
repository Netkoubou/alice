/*
 * 候補ペイン
 */

/*
 * 発注する商品の候補一覧を表で表示するペイン。
 * 商品の品名をクリックすると確定ペインに入る。
 */
'use strict';
var React          = require('react');
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Tooltip        = require('react-bootstrap').Tooltip;
var Fluxxor        = require('fluxxor');
var TableFrame     = require('../components/TableFrame');


/*
 * 候補一覧表の品名セル専用のコンポーネント。
 * ここをクリックすることで、その商品が確定ペインに入る。
 * 品名がアホみたいに長いと、表内で全部を表示できないので、
 * ツールチップで完全な商品名を表示する。
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

    getInitialState: function() { return { is_clickable: false }; },
    onMouseOver:     function() { this.setState({ is_clickable: true }); },
    onMouseLeave:    function() { this.setState({ is_clickable: false }); },

    onSelectCandidate: function() {
        var candidate = this.props.candidate;
        return this.getFlux().actions.addFinalist({ candidate: candidate });
    },

    render: function() {
        var className = '';
        
        if (this.state.is_clickable) {
            className = 'order-candidate-pane-clickable';
        }

        var tooltip = <Tooltip>{this.props.children}</Tooltip>;

        return (
            <OverlayTrigger placement="bottom"
                            overlay={tooltip}
                            onClick={this.onSelectCandidate}
                            onEnter={this.onMouseOver}
                            onExit={this.onMouseLeave}>
              <div className={className}>
                {this.props.children}
              </div>
            </OverlayTrigger>
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
                    value: candidate.maker.name,
                    view:  <span>{candidate.maker.name}</span>
                },
                {
                    value: candidate.trader.name,
                    view:  <span>{candidate.trader.name}</span>
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
