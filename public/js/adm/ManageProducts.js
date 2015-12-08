'use strict';
var React      = require('react');
var Input      = require('react-bootstrap').Input;
var Button     = require('react-bootstrap').Button;
var XHR        = require('superagent');
var Select     = require('../components/Select');
var TableFrame = require('../components/TableFrame');
var Messages   = require('../lib/Messages');

var ManageProducts = React.createClass({
    render: function() {
        var title = [
            { name: '品名',              type: 'string' },
            { name: '品目',              type: 'string' },
            { name: '製造元',            type: 'string' },
            { name: '発注元 部門診療科', type: 'string' },
            { name: '発注先 販売元',     type: 'string' },
            { name: '最安単価',          type: 'number' },
            { name: '現在単価',          type: 'number' },
            { name: '最高単価',          type: 'number' },
            { name: '!',                 type: 'void'   }
        ];

        var data  = [];

        return (
            <div id="manage-products">
              <fieldset id="manage-products-search">
                <div className="manage-products-select">
                  <Select key="部門診療科"
                          placeholder="発注元 部門診療科"
                          value={''}
                          onSelect={function() {} }
                          options={[]} />
                </div>
                <div className="manage-products-select">
                  <Select key="品目"
                          placeholder="品目"
                          value={''}
                          onSelect={function() {} }
                          options={[]} />
                </div>
                <div className="manage-products-select">
                  <Select key="販売元"
                          placeholder="発注先 販売元"
                          value={''}
                          onSelect={function() {} }
                          options={[]} />
                </div>
                <div id="manage-products-input">
                  <Input type="text"
                         bsSize="small"
                         placeholder="検索テキスト"
                         value={''}
                         onChange={function() {} } />
                </div>
                <div id="manage-products-buttons">
                  <Button bsSize="small" onClick={function() {} }>検索</Button>
                </div>
              </fieldset>
              <TableFrame id="manage-products-products"
                          title={title} data={data} />
            </div>
        );
    }
});

module.exports = ManageProducts;
