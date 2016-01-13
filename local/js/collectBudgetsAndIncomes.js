'use strict';
var log4js = require('log4js');
var util   = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('waning');
var log_crit = log4js.getLogger('critical');

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[collectBudgetsAndIncomes] invalid session.');
        return;
    }

    util.query(function(db) {
        var msg;
        var response = {
            status:              0,
            budgets_and_incomes: []
        };

        function fill_names() {
            /*
             * 返り値の部門診療科の名前を埋めるために、全 departments
             * コレクションを引っこ抜く。
             * 何故「全」なのかと言うと、年度の途中で消去された部門診療科
             * に対応するため。
             *
             * 有効な部門診療科を引っこ抜いた後に「全」部門診療科を引っこ抜
             * くとか、頭悪いにも程があるような気がするが、富豪プログラミン
             * グの楽さには勝てない。
             */
            db.collection('departments').find().toArray(function(err, ds) {
                db.close();

                if (err == null) {
                    response.budgets_and_incomes.forEach(function(bai) {
                        if (bai.department_name === '') {
                            ds.forEach(function(d) {
                                var code = bai.department_code.toString();
                                var id   = d._id.toString();

                                if (code === id) {
                                    bai.department_name = d.name;
                                }
                            });
                        }
                    });

                    res.json(response);
                } else {
                    res.json({ status: 255 });
                    log_warn.warn(err);

                    msg = '[collectBudgetsAndIncomes] ' +
                          'failed to access "departments" collection.';

                    log_warn.warn(msg);
                }
            });
        }

        function fill_departments() {
            /*
             * budgets_and_incomes コレクションに取り込まれていない部門診療
             * 科を補填するために、取り敢えず現在有効な部門診療科を全部引っ
             * こ抜く。
             */
            db.collection('departments').find({
                is_alive: true
            }).toArray(function(err, departments) {
                if (err == null) {
                    /*
                     * 有効な部門診療科の中で、budgets_and_incomes コレク
                     * ションに無い部門診療科を探し出す。
                     *
                     * この処理は、きちんと考えて作っていないため、その処理
                     * オーダは、部門診療科数 n に対して O(n**2) で増加して
                     * いく。
                     * このため、部門診療科数がアホみたいに増えると破綻する
                     * 可能性がある。まぁそこまで増えることはないだろうが ...
                     */
                    var freshers = departments.filter(function(d) {
                        var found = false;

                        response.budgets_and_incomes.forEach(function(bai) {
                            var id   = d._id.toString();
                            var code = bai.department_code.toString();

                            if (id === code) {
                                found = true;
                            }
                        });

                        return !found;
                    });


                    /*
                     * budgets_and_incomes コレクションに無い部門診療科を返
                     * り値に追加する。新規追加なので、budget (予算額) も
                     * incomes (収入) も 0 で初期化。
                     *
                     * これら budgets_and_incomes コレクションにない部門診療
                     * 科が、実際に追加されるのは、クライアントが
                     * bookBudgetsAndIncomes API を発行した時であって、ここ
                     * の処理ではないことに注意。
                     */
                    freshers.forEach(function(f) {
                        response.budgets_and_incomes.push({
                            department_code: f._id,
                            department_name: f.name,

                            budget:  0,
                            incomes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                        });
                    });


                    /*
                     * 最後に、部門診療科の名前を埋める (空文字のもののみ)。
                     */
                    fill_names();
                } else {
                    db.close();
                    res.json({ status: 255 });
                    log_warn.warn(err);

                    msg = '[collectBudgetsAndIncomes] ' +
                          'failed to access "departments" collection.';

                    log_warn.warn(msg);
                }
            });
        }


        /*
         * 先ず、budgets_and_incomes コレクションからデータを全て
         * 引っこ抜く。
         */
        db.collection('budgets_and_incomes').find({
            year: req.body.year
        }).toArray(function(err, budgets_and_incomes) {
            if (err == null) {
                /*
                 * 引っこ抜いたデータから、取り敢えず返り値を作成する。
                 * 新規に追加されて未だ budgets_and_incomes コレクションに
                 * 反映されていない部門診療科コードと、各部門診療科名は後で
                 * 補填する。
                 */
                budgets_and_incomes.forEach(function(doc) {
                    response.budgets_and_incomes.push({
                        department_code: doc.department_code,
                        department_name: '',
                        budget:          doc.budget,
                        incomes:         doc.incomes
                    });
                });


                /*
                 * 次に、未だ budgets_and_incomes コレクションに取り込まれて
                 * いない部門診療科を補填する。
                 */
                fill_departments();
            } else {
                db.close();
                res.json({ status: 255 });
                log_warn.warn(err);

                msg = '[collectBudgetsAndIncomes] ' +
                      'failed to access "budgets_and_incomes" collection.';

                log_warn.warn(msg);
            }
        });
    });
};
