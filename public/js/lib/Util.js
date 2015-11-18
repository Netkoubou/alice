module.exports = {
    toOrderTypeName: function(type) {
        if (type === 'ORDINARY_ORDER') {
            return '通常発注';
        }

        return '緊急発注';  // URGENCY_ORDER
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

    toProductStateName: function(state) {
        switch (state) {
        case 'UNORDERED': return '未発注';
        case 'ORDERED':   return '発注済み';
        case 'CANCELED':  return 'キャンセル';
        }

        return '納品済み';  // DELIVERED
    },

    toCostStateName: function(state) {
        switch (state) {
        case 'APPROVING': return '承認待ち';
        case 'APPROVED':  return '承認済み';
        }

        return '却下';      // REJECTED
    }
};
