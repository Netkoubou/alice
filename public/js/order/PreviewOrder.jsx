'use strict';
var React    = require('react');
var ReactDOM = require('react-dom');

var StampRow = React.createClass({
    render: function() {
        return (
            <div>
              <table className="stamp" id="left-stamp">
                <thead>
                  <tr>
                    <th colSpan="5">発注書承認印欄</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>院長</td>
                    <td>部長</td>
                    <td>院務担当</td>
                    <td>室長</td>
                    <td>SPD 担当</td>
                  </tr>
                </tbody>
              </table>

              <table className="stamp" id="right-stamp">
                <thead>
                  <tr>
                    <th colSpan="6">納品書処理印欄</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>確定</td>
                    <td>請求処理</td>
                    <td>確認</td>
                    <td>院務担当</td>
                    <td>確認</td>
                    <td>SPD 担当</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
        var title     = '神奈川歯科大学 附属病院 ';
        var stamp_row = null;

        if (window.opener.info.purpose === 'APPROVAL') {
            title    += '発注依頼書';
            stamp_row = <StampRow />;
        } else {
            title += '注文書';
        }

        return (
            <div id="preview-order">
              <fieldset>
                <h1>{title}</h1>
                {stamp_row}
                <OrderInfos />
                <OrderProducts />  
              </fieldset>
              <button onClick={window.print}>印刷</button>
            </div>
        );
    }
});

ReactDOM.render(<PreviewOrder />, document.getElementById('contents-area') );
