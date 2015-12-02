# 環境構築方法

### 要件

* OS は Linux 若しくは U*IX (BSD 系でも多分問題なし)
* サーバを別途自前で用意する場合 (本番環境)
    * git
    * node
    * npm
* テスト用のサーバまでまるっと構築する場合 (テスト環境)
    * サーバを別途自前で用意する場合の要件に加えて、
    * MongoDB
    * OpenSSL (オレオレ証明書で動かす場合)


### サーバを別途自前で用意する場合

    # git clone https://github.com/Netkoubou/alice.git
    # cd alice
    # npm install
    # npm run build

以上で終わり。
alice/public 以下が Web サーバで公開するドキュメントになる。
後は、Web ブラウザで公開された URL にアクセスすれば OK。


### テスト用のサーバまでまるっと構築する場合

##### 0. MongoDB と OpenSSL をインストールしておき、それぞれ利用可能なようにしておく。

mongodb の起動方法は以下。

    # mongod -config /etc/mongodb.conf &

##### 1. サーバを別途自前で用意する場合の手順を踏む。
##### 2. MongoDB にテストデータを流し込む

    # mongo localhost/alice --quiet local/utils/insert-dummy-data.js

##### 3. オレオレ証明書を作成 (質問に何と答えるかは、スクリプト内のコメント参照)

    # cd local/certs
    # sh ../utils/gen-dummy-certs.sh

##### 4. テスト用サーバを起動

    # cd ../
    # npm run http-server

以上で終了。
https://localhost:8080 にアクセスすれば使える (オレオレ証明書は危険です、と脅されるが、無視すれば使える)。


# 更新方法

開発が進み、古くなった環境を最新に更新する場合の方法は以下

### サーバを別途自前で用意する場合

    # git pull
    # npm install
    # npm run build

これでエラーが出なければ完了。
エラーが出た場合は、続けて以下を試す。

    # rm -Rf node_modules
    # npm update
    # npm run build


### テスト用のサーバまでまるっと更新する場合

まず、テスト用サーバ (http-server) を停止しておく。
次にサーバを別途自前で用意する場合の手順を踏んでから、
以下のようにコマンドを実行して、一旦 MongoDB からデータを綺麗に消し
(テスト用のデータも更新されているかもしれないので) てから、
新しいデータを流し込む。

    # mongo
    > use alice
    > db.dropDatabase
    > exit
    # mongo localhost/alice --quiet local/utils/insert-dummy-data.js

最後にテスト用サーバを起動する。

    # npm run http-server
