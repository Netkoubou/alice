var React  = require('react');
var Input  = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var Table  = require('react-bootstrap').Table;

var TableFrame = React.createClass({
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
