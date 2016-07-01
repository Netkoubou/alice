'use strict';
var React    = require('react');
var ReactDOM = require('react-dom');
var moment   = require('moment');
var d3       = require('d3');

function compute_data() {
    var colors = [
        '#ffbf00',  // between yellow and orange
        '#c71585',  // medium violet red
        '#00ffff',  // Aqua
        '#ffa500',  // orange
        '#800080',  // purple
        '#00ff00',  // green
        '#ff4500',  // orange red
        '#000080',  // Navy
        '#90ee90',  // light green
        '#ffff00',  // Yellow
        '#ff0000',  // Red
        '#0000ff',  // Blue
    ];

    var budgets = window.opener.info.budgets_and_incomes.map(function(bai) {
        return bai.budget;
    });

    var data = [];

    window.opener.info.outgoes.forEach(function(o, department_idx) {
        var x = 0;

        o.outgoes.forEach(function(amount, month_idx) {
            var percent = amount / budgets[department_idx] * 100;

            data.push({
                x:       x,
                y:       department_idx,
                percent: percent,
                color:   colors[month_idx]
            });

            x += percent;
        });
    });

    return data;
}

var DrawIncomeAndOutgoGraph = React.createClass({
    componentDidMount: function() {
        var W = 1024;
        var H = 32 * window.opener.info.outgoes.length + 64;

        var X_LABEL_SPACE =  30;
        var Y_LABEL_SPACE = 256;
        var RIGHT_PADDING =  30;

        var department_names = window.opener.info.outgoes.map(function(o) {
            return o.department_name;
        });

        var svg = d3.select(this.refs.graph)
                    .append('svg')
                    .attr({ width: W, height: H });

        var xscale = d3.scale.linear()
                        .domain([0, 100])
                        .range([0, W - Y_LABEL_SPACE - RIGHT_PADDING]);

        var yscale = d3.scale.ordinal()
                        .domain(department_names)
                        .rangeRoundBands([0, H - X_LABEL_SPACE * 2], 0.4);

        svg.append('g')
            .attr({
                class:     'x axis',
                transform: 'translate(' + Y_LABEL_SPACE + ', '
                                        + X_LABEL_SPACE + ')'
            })
            .call(d3.svg.axis().scale(xscale).orient('top').ticks(5) );

        svg.append('g')
            .attr({
                class:     'x axis',
                transform: 'translate(' + Y_LABEL_SPACE + ', '
                                        + (H - X_LABEL_SPACE) + ')'
            })
            .call(d3.svg.axis().scale(xscale).orient('bottom').ticks(5) );

        svg.append('g')
            .attr({
                class:     'y axis',
                transform: 'translate(' + Y_LABEL_SPACE + ', '
                                        + X_LABEL_SPACE + ')'
            })
            .call(d3.svg.axis()
                    .scale(yscale)
                    .orient('left')
                    .innerTickSize(0)
                    .outerTickSize(0)
                    .tickPadding(10)
            );

        svg.selectAll('rect')
            .data(compute_data() )
            .enter()
            .append('rect')
            .attr({
                x: function(d) { return Y_LABEL_SPACE + xscale(d.x); },
                y: function(d) {
                    return X_LABEL_SPACE + yscale(department_names[d.y]);
                },
                width:  function(d) { return xscale(d.percent); },
                height: yscale.rangeBand(),
                fill:   function(d) { return d.color; }
            })
            .append('title')
            .text(function(d, i) {
                var percent = d.percent.toLocaleString('ja-JP', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                });

                return (i % 12 + 4) + ' 月: ' + percent + ' %';
            });

        var now   = moment();
        var month = now.month();
        var year  = (month < 2)? now.year() - 1: now.year();

        if (year == window.opener.info.year) {
            var months = (month > 3)? month - 3: month + 9;

            svg.append('rect').attr({
                x: Y_LABEL_SPACE + xscale(100 / 12 * (months + 1) ),
                y: X_LABEL_SPACE,
                width:  1,
                height: H - X_LABEL_SPACE * 2,
                fill:   'black'
            });
        }
    },

    render: function() {
        return (
            <div id="graph">
              <h1>{window.opener.info.year} 年度</h1>
              <div ref="graph">
              </div>
            </div>
        );
    }
});

ReactDOM.render(
    <DrawIncomeAndOutgoGraph />, 
    document.getElementById('contents-area')
);
