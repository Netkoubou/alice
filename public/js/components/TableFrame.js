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
var React    = require('react');
var ReactDOM = require('react-dom');


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
            <th key={this.props.colNum} className="table-frame-header">
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
            type: React.PropTypes.oneOf([
                'void',
                'string',
                'number'
            ]).isRequired
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

    makeTitle: function() {
        return this.props.title.map(function(cell, col_num) {
            if (cell.type === 'void') {
                return (<th key={col_num}>{cell.name}</th>);
            } else {
                return (
                    <TFh onClick={this.onSort(col_num)}
                        key={col_num}
                        colNum={col_num}
                        isLastSortTarget={col_num == this.state.col_num}>
                      {cell.name}
                    </TFh>
                );
            }
        }.bind(this) );
    },

    composeData: function() {
        /*
         * this.props.data を表のデータ用に加工する。
         * コピーしたりソートしたりと、いろいろ面倒。
         */
        /*
         * ここで、ソート対象の配列をコピーしている。
         * これは、ソートに sort 関数を用いているためで、sort 関数は対象の
         * 配列を直接更新してしまう。
         * ソート対象は上位要素から属性値として渡された表の生データなわけだが、
         * 属性値を変更することは許されていない。
         * ということで (無駄に思えるが) 一旦ここでコピーしている。
         */
        var data = this.props.data.map(function(row) {
            return row;
        });


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

        return data;
    },

    render: function() {
        /*
         * 表の列の幅を指定するための col を作成
         */
        var cols = this.props.title.map(function(_, i) {
            return <col key={i} />;
        });

        var title = this.makeTitle();
        var data  = this.composeData();


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
                  <colgroup>{cols}</colgroup>
                  <thead><tr>{title}</tr></thead>
                </table>
              </div>
              <div className="table-frame-body">
                <table>
                  <colgroup>{cols}</colgroup>
                  <tbody>{tbody}</tbody>
                </table>
              </div>
            </div>
        );
    }
});


/*
 * TableFrame のセルに input 要素を配置したい、
 * 即ち表の値をユーザが直接変更 / 編集できるようにしたい場合に利用する。
 * ハイライトとかを勝手にやってくれるし、多少は便利。
 */
TableFrame.Input = React.createClass({
    propTypes: {
        placeholder: React.PropTypes.string.isRequired,
        onChange:    React.PropTypes.func.isRequired,
        maxLength:   React.PropTypes.number,
        disabled:    React.PropTypes.bool,
        type:        React.PropTypes.oneOf([
            'string',
            'int',
            'real'
        ]).isRequired
    },

    getInitialState: function() {
        return {
            ref_name: Math.random(),
            value:    this.props.placeholder
        };
    },

    onChange: function(e) {
        var value;

        switch (this.props.type) {
        case 'string':
            value = e.target.value;
            break;
        case 'int':
            if (e.target.value.match(/^-?(\d+)?$/) ) {
                value = e.target.value;
            } else {
                value = '0';
            }

            break;
        default:
            if (e.target.value.match(/^-?(\d+\.?\d*)?$/) ) {
                value = e.target.value;
            } else {
                value = '0.00';
            }
        }
                
        this.setState({ value: value });
    },

    onBlur: function(e) {
        var value = e.target.value;

        switch (this.props.type) {
        case 'int':
            if (value === '' || value === '-') {
                value = '0';
            }

            value = parseInt(value.replace(/,/g, '') );
            this.setState({ value: value.toLocaleString() });
            break;
        case 'real':
            if (value === '' || value === '-') {
                value = '0.00';
            }

            value = parseFloat(value.replace(/,/g, '') );
            this.setState({ value: value.toLocaleString('ja-JP', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            })});
            break;
        }

        this.props.onChange(value);
    },

    onClick: function() {
        ReactDOM.findDOMNode(this.refs[this.state.ref_name]).select();
    },

    render: function() {
        var class_name;

        if (this.props.disabled != null && this.props.disabled) {
            class_name = 'table-frame-input-disabled ';
        } else {
            class_name = 'table-frame-input ';
        }

        if (this.props.type === 'int' || this.props.type === 'real') {
            class_name += 'table-frame-input-number';
        } else {
            class_name += 'table-frame-input-string';
        }

        return (
            <input ref={this.state.ref_name}
                   value={this.state.value}
                   className={class_name}
                   maxLength={this.props.maxLength}
                   disabled={this.props.disabled}
                   onChange={this.onChange}
                   onClick={this.onClick}
                   onBlur={this.onBlur} />
        );
    }
});


/*
 * TableFrame のセルで <select> を使いたい場合に利用する。
 * ほとんど素の <select> と同じ。
 * わざわざ作る意味があるのかは大いに疑問だが、それは言わない約束。
 */
TableFrame.Option = React.createClass({
    propTypes: { value: React.PropTypes.string.isRequired },

    render: function() {
        return (
            <option value={this.props.value}>
              {this.props.children}
            </option>
        );
    }
});

TableFrame.Select = React.createClass({
    propTypes: {
        initialSelected: React.PropTypes.string.isRequired,
        onSelect:        React.PropTypes.func.isRequired
    },

    render: function() {
        return (
            <select value={this.props.initialSelected}
                    onChange={this.props.onSelect}>
              {this.props.children}
            </select>
        );
    }
});

module.exports = TableFrame;
