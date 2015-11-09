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


### サーバを別途自前で用意する場合の構築手順

    # git clone https://github.com/Netkoubou/alice.git
    # cd alice
    # npm install
    # npm run build

以上で終わり。
alice/public 以下が Web サーバで公開するドキュメントになる。
後は、Web ブラウザで公開された URL にアクセスすれば OK。


### テスト用のサーバまでまるっと構築する場合

##### MongoDB と OpenSSL をインストールしておき、それぞれ利用可能なようにしておく。
##### サーバを別途自前で用意する場合の手順を踏む。
##### MongoDB にテストデータを流し込む

    # mongo localhost/alice --quiet local/utils/insert-dummy-data.js

##### オレオレ証明書を作成 (質問に何と答えるかは、スクリプト内のコメント参照)

    # cd local/certs
    # sh ../utils/gen-dummy-certs.sh

##### テスト用サーバを起動

    # cd ../
    # npm run http-server

以上で終了。
https://localhost:8080 にアクセスすれば使える (オレオレ証明書は危険です、と脅されるが、無視すれば使える)。
