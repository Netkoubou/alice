var React      = require('react');
var SearchPane = require('./SearchPane');
var TableFrame = require('../components/TableFrame');

var CandidatePane = React.createClass({
    render: function() {
        var title      = [ '品名', '製造者', '販売元', '単価' ];
        var candidates = [
            { key:  '0', cells: ['a', 'Z', 'あ', 25] },
            { key:  '1', cells: ['b', 'Y', 'い', 24] },
            { key:  '2', cells: ['c', 'X', 'う', 23] },
            { key:  '3', cells: ['d', 'W', 'え', 22] },
            { key:  '4', cells: ['e', 'V', 'お', 21] },
            { key:  '5', cells: ['f', 'U', 'か', 20] },
            { key:  '6', cells: ['g', 'T', 'き', 19] },
            { key:  '7', cells: ['h', 'S', 'く', 18] },
            { key:  '8', cells: ['i', 'R', 'け', 17] },
            { key:  '9', cells: ['j', 'Q', 'こ', 16] },
            { key: '10', cells: ['k', 'P', 'さ', 15] },
            { key: '11', cells: ['l', 'O', 'し', 14] },
            { key: '12', cells: ['m', 'N', 'す', 13] },
            { key: '13', cells: ['n', 'M', 'せ', 12] },
            { key: '14', cells: ['o', 'L', 'そ', 11] },
            { key: '15', cells: ['p', 'K', 'た', 10] },
            { key: '16', cells: ['q', 'J', 'ち',  9] },
            { key: '17', cells: ['r', 'I', 'つ',  8] },
            { key: '18', cells: ['s', 'H', 'て',  7] },
            { key: '19', cells: ['t', 'G', 'と',  6] },
            { key: '20', cells: ['u', 'F', 'な',  5] },
            { key: '21', cells: ['v', 'E', 'に',  4] },
            { key: '22', cells: ['w', 'D', 'ぬ',  3] },
            { key: '23', cells: ['x', 'C', 'ね',  2] },
            { key: '24', cells: ['y', 'B', 'の',  1] },
            { key: '25', cells: ['z', 'A', 'は',  0] }
        ];

        return (
            <fieldset className="order-pane">
              <legend>候補</legend>
              <TableFrame id="order-candidates"
                          title={title}
                          body={candidates} />
            </fieldset>
        );
    }
});

var FinalPane = React.createClass({
    render: function() {
        return (
            <fieldset className="order-pane">
              <legend>確定</legend>
            </fieldset>
        );
    }
});

var Order = React.createClass({
    render: function() {
        return (
            <div>
              <div id="order-left-side">
                <SearchPane />
                <CandidatePane />
              </div>
              <div id="order-right-side">
                <FinalPane />
              </div>
            </div>
        );
    }
});

module.exports = Order;
