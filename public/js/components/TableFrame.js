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

    upBlack:   <span className="table-frame-caret">&#x25b2;</span>,
    downBlack: <span className="table-frame-caret">&#x25bc;</span>,
    upWhite:   <span className="table-frame-caret">&#x25b3;</span>,
    downWhite: <span className="table-frame-caret">&#x25bd;</span>,

    onMouseOver: function() {
        var caret = this.state.is_descending? this.upWhite: this.downWhite; 

        this.setState({
            is_clickable: true,
            caret:        caret
        });
    },

    onMouseLeave: function() {
        this.setState({
            is_clickable: false,
            caret: ''
        });
    },

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

        var class_name = this.state.is_clickable? 'table-frame-clickable': '';

        return (
            <th key={this.props.colNum}>
              <span onClick={this.onClick}
                    onMouseOver={this.onMouseOver}
                    onMouseLeave={this.onMouseLeave}
                    className={class_name}>
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
        var cols = this.props.title.map(function(_, i) {
            return <col key={i} />;
        });

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

        var data = this.props.data.map(function(row) {
            return row;
        });
        
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
