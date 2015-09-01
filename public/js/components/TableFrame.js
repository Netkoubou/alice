/*
 * thead は固定で、tbody だけをスクロールする表。
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

var TableFrame = React.createClass({
    propTypes: {
        id:    React.PropTypes.string.isRequired,
        title: React.PropTypes.array.isRequired,
        data:  React.PropTypes.array.isRequired
    },

    getInitialState: function() {
        return {
            is_ascending: true,
            col_num:      null
        };
    },

    onSort: function(col_num) {
        var is_ascending = this.state.is_ascending;

        if (col_num == this.state.col_num) {
            is_ascending = !is_ascending;
        }

        this.setState({
            is_ascending: is_ascending,
            col_num:      col_num
        });
    },

    render: function() {
        var cols  = this.props.title.map(function(_, i) {
            return <col key={i} />;
        });

        var title = this.props.title.map(function(cell, i) {
            return (
              <th onClick={function() { this.onSort(i) }.bind(this) }
                  key={i}>
                {cell.name}
              </th>
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

                if (this.state.is_ascending) {
                    return (type === 'number')? obj_a - obj_b: obj_a < obj_b;
                } else {
                    return (type === 'number')? obj_b - obj_a: obj_b < obj_a;
                }
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
