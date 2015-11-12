module.exports = {
    ajax: {
        INDEX_AUTHENTICATE_USER:
            'AJAX error: authenticateUser in index.js\n\n' +
            'ネットワークの問題でログインに失敗しました。\n' +
            'ネットワークの接続を確認して下さい。\n' +
            '問題が解決しない場合はネットワーク管理者に問い合わせて下さい。',

        INDEX_LOGOUT:
            'AJAX error: logout in index.js\n\n' +
            'ネットワークの問題でログアウトに失敗しました。\n' +
            'ネットワークの接続を確認して下さい。\n' +
            '問題が解決しない場合はネットワーク管理者に問い合わせて下さい。',

        ORDER_SEARCH_CANDIDATES:
            'AJAX error: searchCandidates in Order.js\n\n' +
            'ネットワークの問題で発注候補の検索に失敗しました。\n' +
            'ネットワークの接続を確認して下さい。\n' +
            '問題が解決しない場合はネットワーク管理者に問い合わせて下さい。',

        FINAL_PANE_REGISTER_ORDER:
            'AJAX error: registerOrder in FinalPane.js\n\n' +
            'ネットワークの問題で発注の登録に失敗しました。\n' +
            'ネットワークの接続を確認して下さい。\n' +
            '問題が解決しない場合はネットワーク管理者に問い合わせて下さい。',

        FINAL_PANE_UPDATE_ORDER:
            'AJAX error: updateOrder in FinalPane.js\n\n' +
            'ネットワークの問題で発注の更新に失敗しました。\n' +
            'ネットワークの接続を確認して下さい。\n' +
            '問題が解決しない場合はネットワーク管理者に問い合わせて下さい。',

        FINAL_PANE_ERASE_ORDER:
            'AJAX error: eraseOrder in FinalPane.js\n\n' +
            'ネットワークの問題で発注の消去に失敗しました。\n' +
            'ネットワークの接続を確認して下さい。\n' +
            '問題が解決しない場合はネットワーク管理者に問い合わせて下さい。',

        FINAL_PANE_CHANGE_ORDER_STATE:
            'AJAX error: changeOrderState in FinalPane.js\n\n' +
            'ネットワークの問題で発注の状態変更に失敗しました。\n' +
            'ネットワークの接続を確認して下さい。\n' +
            '問題が解決しない場合はネットワーク管理者に問い合わせて下さい。',

        SEARCH_PANE_PICK_MENU_ITEMS_FOR_SEARCH_PANE:
            'AJAX error: pickMenuItemsForSearchPane in SearchPane.js\n\n' +
            'ネットワークの問題でメニューの項目の獲得に失敗しました。\n' +
            'ネットワークの接続を確認して下さい。\n' +
            '問題が解決しない場合はネットワーク管理者に問い合わせて下さい。',

        ORDER_LIST_SEARCH_ORDERS:
            'AJAX error: searchOrders in OrderList.js\n\n' +
            'ネットワークの問題で発注の検索に失敗しました。\n' +
            'ネットワークの接続を確認して下さい。\n' +
            '問題が解決しない場合はネットワーク管理者に問い合わせて下さい。',

        APPROVE_CHANGE_ORDER_STATE:
            'AJAX error: changeOrderState in Approve.js\n\n' +
            'ネットワークの問題で発注の状態変更に失敗しました。\n' +
            'ネットワークの接続を確認して下さい。\n' +
            '問題が解決しない場合はネットワーク管理者に問い合わせて下さい。',

        CHANGE_PASSWORD_CHANGE_PASSWORD:
            'AJAX error: changePassword in ChangePassword.js\n\n' +
            'ネットワークの問題で発注の状態変更に失敗しました。\n' +
            'ネットワークの接続を確認して下さい。\n' +
            '問題が解決しない場合はネットワーク管理者に問い合わせて下さい。',

        REGISTER_MESSAGE_REGISTER_FOOTER_MESSAGE:
            'AJAX error: registerFooterMessage in RegisterMessage.js\n\n' +
            'ネットワークの問題でメッセージの登録に失敗しました。\n' +
            'ネットワークの接続を確認して下さい。\n' +
            '問題が解決しない場合はネットワーク管理者に問い合わせて下さい。',
    },

    server: {
        INDEX_AUTHENTICATE_USER:
            'Server error: authenticateUser in index.js\n\n' +
            'ログインでサーバにエラーが発生しました。\n' +
            'サーバ管理者に問い合わせて下さい。',

        INDEX_LOGOUT:
            'Server error: logout in index.js\n\n' +
            'ログアウトでサーバにエラーが発生しました。\n' +
            'サーバ管理者に問い合わせて下さい。',

        ORDER_SEARCH_CANDIDATES:
            'Server error: searchCandidates in Order.js\n\n' +
            '発注候補の検索でサーバにエラーが発生しました。\n' +
            'サーバ管理者に問い合わせて下さい。',

        FINAL_PANE_REGISTER_ORDER:
            'Server error: registerOrder in FinalPane.js\n\n' +
            '発注の登録でサーバにエラーが発生しました。\n' +
            'サーバ管理者に問い合わせて下さい。',

        FINAL_PANE_UPDATE_ORDER:
            'Server error: updateOrder in FinalPane.js\n\n' +
            '発注の更新でサーバにエラーが発生しました。\n' +
            'サーバ管理者に問い合わせて下さい。',

        FINAL_PANE_ERASE_ORDER:
            'Server error: eraseOrder in FinalPane.js\n\n' +
            '発注の消去でサーバにエラーが発生しました。\n' +
            'サーバ管理者に問い合わせて下さい。',

        FINAL_PANE_CHANGE_ORDER_STATE:
            'Server error: changeOrderState in FinalPane.js\n\n' +
            '発注の状態変更でサーバにエラーが発生しました。\n' +
            'サーバ管理者に問い合わせて下さい。',

        SEARCH_PANE_PICK_MENU_ITEMS_FOR_SEARCH_PANE:
            'Server error: pickMenuItemsForSearchPane in SearchPane.js\n\n' +
            'メニューの項目の獲得でサーバにエラーが発生しました。\n' +
            'サーバ管理者に問い合わせて下さい。',

        ORDER_LIST_SEARCH_ORDERS:
            'Server error: searchOrders in OrderList.js\n\n' +
            '発注の検索でサーバにエラーが発生しました。\n' +
            'システム管理者に問い合わせて下さい。',

        APPROVE_CHANGE_ORDER_STATE:
            'Server error: changeOrderState in Approve.js\n\n' +
            '発注の状態変更でサーバにエラーが発生しました。\n' +
            'サーバ管理者に問い合わせて下さい。',

        CHANGE_PASSWORD_CHANGE_PASSWORD:
            'Server error: changePassword in ChangePassword.js\n\n' +
            'パスワードの変更でサーバにエラーが発生しました。\n' +
            'サーバ管理者に問い合わせて下さい。',

        REGISTER_MESSAGE_REGISTER_FOOTER_MESSAGE:
            'Server error: registerFooterMessage in RegisterMessage.js\n\n' +
            'メッセージの登録でサーバにエラーが発生しました。\n' +
            'サーバ管理者に問い合わせて下さい。',
    },

    internal: {
        UNEXPECTED_ACTION:
            'Internal error: render method in EditOrder, EditOrder.js\n\n' +
            'クライアントの JavaScript でエラーが発生しました。\n' +
            'システム管理者に問い合わせて下さい。',
    },

    information: {
        UPDATE_CONFLICT:
            '既に他のユーザが更新した古いデータを更新しようとしたため、\n' +
            '更新を中断しました。\n' +
            'お手数ですが、再度最初からやり直してく下さい。',
    },
};
