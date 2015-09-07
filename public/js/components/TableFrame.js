/*
 * thead は固定で、tbody だけをスクロールする表。
 * 各行によるソートにも対応している。
 *
 * デフォルトの <table> と異なり、本実装では thead や tbody に相当するデー
 * タを属性として渡す。
 * また、実装上の都合であるが、tbody だけをスクロールさせるため、thead と
 * tbody を別の表 (<table>) としている。
 * そのため、各列の幅を CSS の col:nth-child で指定してやらないと、表のタイ
 * トルと内容がズレて表示されてしまう。
 * 具体的な指定例は css/Order.css を参照。
 */
'use strict';
var React = require('react');
var Table = require('react-bootstrap').Table;


/*
 * <th> の TableFrame 版 (TableFrame Header の略のつもり)
 */
var TFh = React.createClass({
    propTypes: {
        onClick:          React.PropTypes.func.isRequired,
        colNum:           React.PropTypes.number.isRequired,
        isLastSortTarget: React.PropTypes.bool.isRequired
    },

    getInitialState: function() {
        return({
            is_clickable:  false,
            is_descending: false,
            caret:         ''
        });
    },


    /*
     * <th> 要素 (の中の <span> 要素) をクリックすると、その列の値で表を
     * ソートできる。
     * この時、現在どの列でソートされているのかを黒い三角で示す。
     * また、マウスのポインタが <th> 要素の上空にさしかかると、白い三角でソー
     * ト方向を示す。
     * ソートされている列の <th> 要素の上空にマウスのポインタがさしかかると、
     * 現在のソート方向 (黒い三角の向き) とは逆向きの白い三角が表示される。
     * 一方、それ以外の列は (たいていの場合並びはバラバラであろうが) とりあ
     * えず降順にソートすることにした (つまり、マウスのポインタが上空にさし
     * かかると、下向きの白い三角が現われる)。
     * このあたりのロジックは意外に複雑なので、コードを読む場合はちょっと気
     * 合が必要かもしれない。
     */
    upBlack:   <span className="table-frame-caret">&#x25b2;</span>,
    downBlack: <span className="table-frame-caret">&#x25bc;</span>,
    upWhite:   <span className="table-frame-caret">&#x25b3;</span>,
    downWhite: <span className="table-frame-caret">&#x25bd;</span>,

    onMouseOver: function() {
        var caret = this.state.is_descending? this.upWhite: this.downWhite; 
        this.setState({ caret: caret });
    },

    onMouseLeave: function() { this.setState({ caret: '' }); },

    onClick: function() {
        var caret = this.state.is_descending? this.downWhite: this.upWhite; 

        this.props.onClick(!this.state.is_descending);
        this.setState({
            is_descending: !this.state.is_descending,
            caret:         caret
        });
    },

    render: function() {
        var caret = '';

        if (this.state.caret != '') {
            caret = this.state.caret;
        } else if (this.props.isLastSortTarget) {
            caret = this.state.is_descending? this.downBlack: this.upBlack;
        }

        return (
            <th key={this.props.colNum}>
              <span onClick={this.onClick}
                    onMouseOver={this.onMouseOver}
                    onMouseLeave={this.onMouseLeave}> 
                {this.props.children}
              </span>
              {caret}
            </th>
        );
    }
});

var TableFrame = React.createClass({
    propTypes: {
        id:    React.PropTypes.string.isRequired,
        title: React.PropTypes.arrayOf(React.PropTypes.shape({
            name: React.PropTypes.string.isRequired,
            type: React.PropTypes.oneOf(['string', 'number']).isRequired
        }) ).isRequired,
        data: React.PropTypes.oneOfType([
            React.PropTypes.array,
            React.PropTypes.arrayOf(React.PropTypes.shape({
                value: React.PropTypes.string.isRequired,
                view:  React.PropTypes.element.isRequired
            }) )
        ]).isRequired
    },

    getInitialState: function() {
        return {
            col_num:       null,
            is_descending: null
        };
    },

    onSort: function(col_num) {
        return function(is_descending) {
            this.setState({
                col_num:       col_num,
                is_descending: is_descending
            });
        }.bind(this);
    },

    render: function() {
        /*
         * 表の列の幅を指定するための col を作成
         */
        var cols = this.props.title.map(function(_, i) {
            return <col key={i} />;
        });


        /*
         * 表のタイトル
         */
        var title = this.props.title.map(function(cell, col_num) {
            return (
                <TFh onClick={this.onSort(col_num)}
                     key={col_num}
                     colNum={col_num}
                     isLastSortTarget={col_num == this.state.col_num}>
                  {cell.name}
                </TFh>
            );
        }.bind(this) );


        /*
         * ここからが、表をソートするためのコード。
         * 上位要素から (属性として) 渡された表の生データを、表示する度に
         * ソートする。
         * ソートした結果を状態として保持していないことに注意。
         *
         * 表の各セルに相当する生データは、
         *
         *   - value: データの生の値
         *   - view:  React オブジェクト
         *
         * という構造を持っている (propTypes 参照)。
         * value はソート用で、view は表示 (render) 用。
         * つまり、上位要素で表の各セルの view を予め構成して TableFrame に
         * 渡す必要がある。
         */

        /*
         * ここで、ソート対象の配列をコピーしている。
         * これは、ソートに sort 関数を用いているためで、sort 関数は対象の
         * 配列を直接更新してしまう。
         * ソート対象は上位要素から渡された表の生データなわけだが、属性値を
         * 変更することは許されていない。
         * ということで (無駄に見えるが) 一旦ここでコピーしている。
         */
        var data = this.props.data.map(function(row) {
            return row;
        });
        

        /*
         * ここでコピーした配列をソート
         */
        if (this.state.col_num != null) {
            data.sort(function(a, b) {
                var obj_a = a[this.state.col_num].value;
                var obj_b = b[this.state.col_num].value;
                var type  = this.props.title[this.state.col_num].type;

                if (this.state.is_descending) {
                    if (type === 'number') {
                        return obj_a - obj_b;
                    }
                    
                    if (obj_a < obj_b) {
                        return -1;
                    } else if (obj_a > obj_b) {
                        return  1;
                    }
                } else {
                    if (type === 'number') {
                        return obj_b - obj_a;
                    }
                    
                    if (obj_b < obj_a) {
                        return -1;
                    } else if (obj_b > obj_a) {
                        return  1;
                    }
                }

                return 0;
            }.bind(this) );
        }


        /*
         * ソートした配列の順に表の内容を作成
         */
        var tbody = data.map(function(row, i) {
            var tr = row.map(function(cell, j) {
                return <td key={j}>{cell.view}</td>;
            });

            return <tr key={i}>{tr}</tr>;
        });

        return (
            <div id={this.props.id} className="table-frame">
              <div className="table-frame-title">
                <table>
                  {cols}
                  <thead><tr>{title}</tr></thead>
                </table>
              </div>
              <div className="table-frame-body">
                <Table>
                  <tbody>
                    {cols}
                    {tbody}
                  </tbody>
                </Table>
              </div>
            </div>
        );
    }
});

module.exports = TableFrame;
