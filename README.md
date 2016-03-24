# テスト環境構築方法

### 要件

* OS は Linux、BSD 系などの U*IX が楽。 Mac OS X や Windows でも (ちょっと頑張る必要があるかもしれないけど) 多分イケる。
* git
* node (v5.1.0 以上)
* npm
* MongoDB
* OpenSSL


### 構築手順

##### 0. 要件の準備

上記の要件に挙がっているソフトウェアをインストールしておく。

##### 1. ソースコードの取得

    % git clone https://github.com/Netkoubou/alice.git
    % cd alice

#### 2. クライアントコードのコンパイル

    % npm install
    % npm run build-dist

alice/public 以下が Web サーバで公開するドキュメントになる。

上記のままでも動作には問題ないが、クライアント (Web ブラウザ側) のデバックを
考慮するのならば、

    % npm run build-dist

の代わりに (或いはその後でも構わない)

    % npm run build

とすると、デバッグがし易くなる。

##### 3. MongoDB にテストデータを流し込む

先ずは mongodb を起動方法する。

    % su
    $ su mongodb
    % mongod --config /etc/mongodb.conf

若しくは

    % sudo -u mongodb mongod --config /etc/mongodb.conf

起動したら、テストデータを流し込む。

    % mongo localhost/alice --quiet local/utils/insert-dummy-data.js


##### 4. SSL のオレオレ証明書と秘密鍵を作成 (質問に何と答えるかは、スクリプト内のコメント参照)

    % cd local/certs
    % sh ../utils/gen-dummy-certs.sh

##### 5. HTTP サーバを起動

    % cd ../
    % sudo npm run http-server

以上で終了だが、https の well-known ポート (443 番) を使うため、起動には root 権限が必要なことに注意。
起動したら、Web ブラウザで https://localhost にアクセスすれば使える
(オレオレ証明書は危険です、と脅されるが、無視すれば使える)。


### [番外] テスト用サーバがエラーを吐いて起動してくれない場合には

以下をチェック。

##### 0. ログ用ディレクトリ local/log のパーミッション

テスト用サーバは local/log にログを吐き出すのだが、
ファイルの書き込み権限がないと起動時に異常終了する。

##### 1. SSL の証明書と秘密鍵

テスト用サーバは https しか話さないため、SSL の証明書と
(パスワード除去済みの) 秘密鍵は必須。
以下の名前で用意しておく必要がある。

  - local/certs/cert.pem
  - local/certs/key.pem

あたりまえだが、テスト用サーバが上記のファイルを読めるような
パーミッションが必要。


##### 2. 443 番ポートの利用状況

テスト用サーバは 443 番ポートを使うのだが、他で利用されていると起動に失敗する。
443 番ポートを利用する他のプログラムや、
前に起動したままのテスト用サーバがないか netstat コマンドなどで確認する。

443 番以外のポートを利用したい場合は、local/js/http-server.js の

    }, $).listen(443);
                 ^^^^

を直接書き変える。
その場合は Web ブラウザでアクセスする際の URL のポート番号も変えること。
例えば、8080 番ポートを利用する場合は、

    https://localhost:8080

にアクセスすること。


### 更新方法

開発が進み、古くなった環境を最新に更新する場合、構築時に npm コマンドを実行したディレクトリに行ってから、

    % git pull
    % npm install
    % npm run build-dist

ここでエラーが出た場合は、続けて以下を試す。

    % rm -Rf node_modules
    % npm update
    % npm run build-dist

デバックを考慮するのであれば、build-dist の代わりに build を使うこと。

次に HTTP サーバ (http-server) を停止してから、以下のように一旦 MongoDB からデータを綺麗に消し (テスト用のデータも更新されているかもしれないので)、新しいデータを流し込む。

    % mongo
    > use alice
    > db.dropDatabase()
    > exit
    % mongo localhost/alice --quiet local/utils/insert-dummy-data.js

最後に HTTP サーバを起動して完了。

    % sudo npm run http-server
