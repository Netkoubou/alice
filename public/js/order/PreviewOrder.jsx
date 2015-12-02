'use strict';
var React    = require('react');
var ReactDOM = require('react-dom');

var StampRow = React.createClass({
    render: function() {
        return (
            <table id="stamp">
              <thead>
                <tr>
                  <th>病院長</th>
                  <th>部長</th>
                  <th></th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
        );
    }
});

var OrderInfos = React.createClass({
    render: function() {
        return (
            <div id="infos">
              <table id="left-infos">
                <tbody>
                  <tr>
                    <td className="info-name">発注先 販売元</td>
                    <td className="info-data">
                      {window.opener.info.trader} 様
                    </td>
                  </tr>
                  <tr>
                    <td className="info-name">発注元 部門診療科</td>
                    <td className="info-data">
                      {window.opener.info.department}
                    </td>
                  </tr>
                  <tr>
                    <td className="info-name">起案番号</td>
                    <td className="info-data">
                      {window.opener.info.order_code}
                    </td>
                  </tr>
                </tbody>
              </table>
  
              <table id="right-infos">
                <tbody>
                  <tr>
                    <td className="info-name">起案日</td>
                    <td className="info-data">
                      {window.opener.info.drafting_date}
                    </td>
                  </tr>
                  <tr>
                    <td className="info-name">発注日</td>
                    <td className="info-data">
                      {window.opener.info.order_date}
                    </td>
                  </tr>
                  <tr>
                    <td className="info-name">連絡先</td>
                    <td className="info-data">TEL & FAX: 046-822-9640</td>
                  </tr>
                </tbody>
              </table>
            </div>
        );
    }
});

var OrderProducts = React.createClass({
    composeProduct: function(product, index) {
        var subtotal     = product.price * product.quantity;
        var price_string = product.price.toLocaleString('ja-JP', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });

        var quantity_string = product.quantity.toLocaleString();
        var subtotal_string = subtotal.toLocaleString('ja-JP', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });

        var name  = product.name;
        var maker = product.maker;

        return (
            <tr key={index}>
              <td className="products-data-number">{index + 1}</td>
              <td className="products-data-string">{name}</td>
              <td className="products-data-string">{maker}</td>
              <td className="products-data-number">{price_string}</td>
              <td className="products-data-number">{quantity_string}</td>
              <td className="products-data-number">{subtotal_string}</td>
              <td></td>
            </tr>  
        );
    },

    render: function() {
        var total    = 0.0;
        var products = window.opener.info.products.map(function(p, i) {
            total += p.price * p.quantity;
            return this.composeProduct(p, i);
        }.bind(this) );

        products.push(
            <tr key={Math.random()}>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td className="products-data-number">合計</td>
              <td className="products-data-number">
                {Math.floor(total).toLocaleString()}
              </td>
              <td></td>
            </tr>
        );

        return (
            <table id="products">
              <thead>
                <tr>
                  <td className="products-header">No.</td>
                  <td className="products-header">品名</td>
                  <td className="products-header">製造元</td>
                  <td className="products-header">単価</td>
                  <td className="products-header">数量</td>
                  <td className="products-header">小計</td>
                  <td className="products-header">済み</td>
                </tr>
              </thead>
              <tbody>
                {products}
              </tbody>
            </table>
        );
    }
});

var PreviewOrder = React.createClass({
    render: function() {
        return (
            <div id="preview-order">
              <fieldset>
                <h1>神奈川歯科大学 附属病院 発注書</h1>
                {window.opener.info.purpose === 'APPROVAL'? <StampRow />: null}
                <OrderInfos />
                <OrderProducts />  
              </fieldset>
              <button onClick={window.print}>印刷</button>
            </div>
        );
    }
});

ReactDOM.render(<PreviewOrder />, document.getElementById('contents-area') );
