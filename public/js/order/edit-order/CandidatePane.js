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
        }) ).isRequired,

        selected: React.PropTypes.string
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


    /*
     * 選択された発注候補一覧を、テーブルの一番上に表示するためのコード。
     * 検索直後に発注候補の物品を選択すると、その発注元の物品だけが表示
     * されるようテーブルが再構成される。
     * そうすると、多くの場合選択した物品を見失ってしまい、
     * 操作性を著しく損ねてしまう。
     * これを避けるため、テーブルが再構成される際、
     * 選択した物品をテーブルの (表示領域の) 一番上に表示するようにする。
     *
     * まぁ、単に (発注候補一覧を表示する) TableFrame のプロパティである
     * scrollTopIndex (TableFrame.js 参照) を算出しているだけなのだが、
     * TableFrame をレンダリングする前にその値を算出する必要があるため、
     * componentWillUpdate で対処している。
     */
    componentWillUpdate: function(next_props) {
        var next_len = next_props.candidates.length;
        var cur_len  = this.props.candidates.length;

        this.scrollTopIndex = null;


        /*
         * 検索直後に発注候補である物品を選択すると、その販売元以外の物品は
         * 除外される。つまり、
         *
         *   現在の候補一覧の数 > 次に表示する候補一覧の数
         *
         * となる訳で、この場合のみ選択した物品を一番上に表示する動作 (要は
         * テーブルをスクロールする訳ですな) が必要となる。
         *
         *   現在の候補一覧の数 == 次に表示する候補一覧の数
         *
         * の場合は、テーブルの内容は変わっていないため、表示内容は変えるべ
         * きではない。
         *
         * this.props.selected が、テーブルの一番上に表示したい物品、
         * 即ち検索直後に選択された物品のコード。
         * その物品が新しい物品一覧の何番目に位置するかを調べる。
         */
        if (cur_len > next_len && next_props.selected != null) {
            for (var i = 0; i < next_len; i++) {
                var candidate = next_props.candidates[i];

                if (next_props.selected === candidate.product_code) {
                    this.scrollTopIndex = i;
                    break;
                }
            }
        }
    },

    render: function() {
        var title = this.makeTableFrameTitle();
        var data  = this.composeTableFrameData();

        return (
            <fieldset id="candidate-pane" className="edit-order-pane">
              <legend>候補</legend>
              <TableFrame id="candidate-pane-candidates"
                          scrollTopIndex={this.scrollTopIndex}
                          title={title} data={data} />
            </fieldset>
        );
    }
});

module.exports = CandidatePane;
