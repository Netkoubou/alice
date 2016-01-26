'use strict';
var React    = require('react');
var ReactDOM = require('react-dom');
var d3       = require('d3');

var DrawIncomeAndOutgoGraph = React.createClass({
    componentDidMount: function() {
        d3.select(this.refs.graph)
           .append("p")
           .text("New paragraph!");
    },

    render: function() {
        return (
            <div ref="graph"></div>
        );
    }
});

ReactDOM.render(
    <DrawIncomeAndOutgoGraph width={768} height={1280} />, 
    document.getElementById('contents-area')
);
