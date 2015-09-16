var React      = require('react');
var TableFrame = require('../components/TableFrame');

var OrderList = React.createClass({
    propTypes: { user: React.PropTypes.object.isRequired },

    render: function() {
        var title = [
            { name: '起案番号',      type: 'string' },
            { name: '起案日',        type: 'string' },
            { name: '起案者',        type: 'string' },
            { name: '発注区分',      type: 'string' },
            { name: '発注元 診療科', type: 'string' },
            { name: '発注先 販売元', type: 'string' },
            { name: '総計',          type: 'number' },
            { name: '状態',          type: 'string' }
        ];

        var data = [];

        return (
            <div id="order-list">
              <div id="order-list-search">
              </div>
              <TableFrame id="order-list-table" title={title} data={data} />
            </div>
        );
    }
});

module.exports = OrderList;
