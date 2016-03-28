'use strict';
var React           = require('react');
var Button          = require('react-bootstrap').Button;
var Glyphicon       = require('react-bootstrap').Glyphicon;
var DateRangePicker = require('react-bootstrap-daterangepicker');
var moment          = require('moment');

var CalendarMarker = React.createClass({
    propTypes: {
        startDate: React.PropTypes.object.isRequired,
        endDate:   React.PropTypes.object.isRequired,
        onMark:    React.PropTypes.func.isRequired
    },

    onEvent: function(event, picker) {
        this.props.onMark(picker.startDate, picker.endDate);
    },

    makeLocale: function() {
        return {
            format:           'YYYY/MM/DD',
            applyLabel:       '確定',
            cancelLabel:      'キャンセル',
            customRangeLabel: '自由指定',
            daysOfWeek: [ '日', '月',  '火', '水', '木', '金', '土' ],
            monthNames: [
                 '1 月',
                 '2 月',
                 '3 月',
                 '4 月',
                 '5 月',
                 '6 月',
                 '7 月',
                 '8 月',
                 '9 月',
                '10 月',
                '11 月',
                '12 月'
            ],
            firstDay: 0
        };
    },

    makeRanges: function() {
        return {
            '今日': [ moment(), moment() ],
            '昨日': [
                moment().subtract(1, 'days'),
                moment().subtract(1, 'days')
            ],
            '過去 7 日間': [
                moment().subtract(6, 'days'),
                moment(),
            ],
            '今週': [
                moment().startOf('week'),
                moment().endOf('week')
            ],
            '先週': [
                moment().subtract(1, 'week').startOf('week'),
                moment().subtract(1, 'week').endOf('week')
            ],
            '過去 30 日間': [
                moment().subtract(29, 'days'),
                moment()
            ],
            '今月': [
                moment().startOf('month'),
                moment().endOf('month')
            ],
            '先月': [
                moment().subtract(1, 'month').startOf('month'),
                moment().subtract(1, 'month').endOf('month')
            ]
        };
    },

    render: function() {
        var locale = this.makeLocale();
        var ranges = this.makeRanges();
        var start  = this.props.startDate.format('YYYY/MM/DD');
        var end    = this.props.endDate.format('YYYY/MM/DD');
        var label  = (start === end)? start: start + ' - ' + end;

        return (
            <DateRangePicker startDate={this.props.startDate}
                             endDate={this.props.endDate}
                             ranges={ranges}
                             locale={locale}
                             onEvent={this.onEvent}>
              <Button>
                <div className="pull-left">
                  <Glyphicon glyph="calendar" />
                </div>
                <div className="pull-right">
                  <span className="calendar-marker-label">{label}</span>
                  <span className="caret" />
                </div>
              </Button>
            </DateRangePicker>
        );
    }
});

module.exports = CalendarMarker;
