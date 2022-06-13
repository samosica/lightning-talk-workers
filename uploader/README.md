# Slack to GDrive
## セットアップ
1. `firebase functions:config:set`を用いて，以下のパラメータをセットする：
    - `gdrive.folder_id`: Google Drive で月ごとのフォルダを格納するフォルダの ID．指定したフォルダの共有先にデフォルトサービスアカウント（`...@appspot.gserviceaccount.com`．調べ方は[ローカル環境で試す](#ローカル環境で試す)の 5.3 を参照）を追加する必要がある．
    - `slack.token`，`slack.signing_secret`: Slack アプリケーションの token と signing secret．
2. `firebase deploy --only functions`でデプロイを行なう．
3. `slack`関数のエンドポイントの末尾に`/events`を加えたものを Slack アプリのイベントのリクエスト URL として指定する．

## ローカル環境で試す
最初に以下の準備を行なう：
1. カレントディレクトリを`functions/`にする．
2. `firebase functions:config:get > .runtimeconfig.json`を実行する
3. 使用する Slack アプリケーションでソケットモードを有効にする．すると，app-level token が手に入るのでメモしておく．
4. `.runtimeconfig.json`を次のように書き換える：
```
{
    "app": {
        "mode": "development"
    },
    "slack": {
        ...
        "app_token": (手に入れた app-level token)
    },
    ...
}
```
5. デフォルトサービスアカウントの credential をダウンロードする．
    1. [Google Cloud Platform のコンソール](https://console.cloud.google.com)を開く
    2. ハンバーガーボタン（≡）をクリックしてサイドメニューを表示し，「APIとサービス」，「認証情報」を選択する
    3. すると，サービスアカウントの一覧が出てくるので，その中からデフォルトサービスアカウント（`...@appspot.gserviceaccount.com`）を選ぶ
    4. 「キー」のタブを開き，「鍵を追加」，「新しい鍵を作成」をクリックする．キーのタイプは JSON にして，「作成」を押す．そうすると，credential のダウンロードが始まる．
6. `dev.env`に`GOOGLE_APPLICATION_CREDENTIALS=(credential のパス)`を書き込む．

その後，`npm run serve`で試すことができる．
**GCP 上で動かすときは Slack アプリケーションのソケットモードを無効にすること．**