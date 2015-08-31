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
var React  = require('react');
var Input  = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var Table  = require('react-bootstrap').Table;

var TableFrame = React.createClass({
    propTypes: {
        id:    React.PropTypes.string.isRequired,
        title: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        body:  React.PropTypes.arrayOf(React.PropTypes.object).isRequired
    },

    render: function() {
        var cols  = this.props.title.map(function(_, i) {
            return <col key={i} />;
        });

        var title = this.props.title.map(function(th, i) {
            return <th key={i}>{th}</th>;
        });

        var body = this.props.body.map(function(row) {
            var tr = row.cells.map(function(cell, i) {
                return <td key={i}>{cell}</td>;
            });
                
            return (
                <tr key={row.key}>
                    {tr}
                </tr>
            );
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
                    {body}
                  </tbody>
                </Table>
              </div>
            </div>
        );
    }
});

module.exports = TableFrame;
