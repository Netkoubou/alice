'use strict';
var React      = require('react');
var moment     = require('moment');
var Select     = require('../components/Select');
var TableFrame = require('../components/TableFrame');

var InputAmount = React.createClass({
    getInitialState: function() {
        var now = moment();

        return {
            year: (now.month < 2)? now.year() - 1: now.year()
        }
    },

    onSelectYear: function(e) { this.setState({ year: e.code }); },

    render: function() {
        var start_year = 2015;
        var now        = moment();
        var this_year  = (now.month < 2)? now.year() - 1: now.year();
        var years      = [];

        for (var i = start_year; i < this_year; i++) {
            years.push({ code: i, name: i });
        }

        return (
          <Select placeholder={this.state.year.toString()}
                  onSelect={this.onSelectYear}
                  value={this.state.year}
                  options={years} />

        );
    }
});

module.exports = InputAmount;
