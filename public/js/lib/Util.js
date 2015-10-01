module.exports = {
    toOrderTypeName: function(type) {
        switch (type) {
        case 'ORDINARY_ORDER': return '通常発注';
        case 'URGENCY_ORDER':  return '緊急発注';
        }

        return '薬剤発注';  // MEDS_ORDER
    },

    toOrderStateName: function(state) {
        switch (state) {
        case 'REQUESTING': return '依頼中';
        case 'APPROVING':  return '承認待ち';
        case 'APPROVED':   return '承認済み';
        case 'NULLIFIED':  return '無効';
        }

        return '完了';  // COMPLETED
    },

    toGoodsStateName: function(state) {
        switch (state) {
        case 'PROCESSING': return '処理中';
        case 'ORDERED':    return '発注済み';
        case 'CANCELED':   return 'キャンセル';
        }

        return '納品済み';  // DELIVERED
    },

    toCanonicalizedDate: function(date) {
        var yyyy  = date.getFullYear().toString();
        var month = date.getMonth() + 1;
        var day   = date.getDate();
        var mm    = month.toString();
        var dd    = day.toString();

        if (month < 10) {
            mm = '0' + mm;
        }

        if (day < 10) {
            dd = '0' + dd;
        }

        return yyyy + '/' + mm + '/' + dd;
    }
};
