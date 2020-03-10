# mv-plugins
RPGアツマール公式による、RPGツクールMVプラグインです。

# 提供プラグイン一覧

## アツマールAPIを利用するためのプラグイン

### AtsumaruCreatorInformationModal.js

アツマールAPIの「作者情報ダイアログ」を利用するためのプラグインです。
詳しくは[アツマールAPIリファレンス](https://atsumaru.github.io/api-references/creator-modal)を参照してください。

- [プラグイン](https://raw.githubusercontent.com/atsumaru/mv-plugins/master/plugins/AtsumaruCreatorInformationModal.js)
- [ソースコード](https://github.com/atsumaru/mv-plugins/blob/master/src/AtsumaruCreatorInformationModal.ts)

### AtsumaruGetRecentUsers.js

アツマールAPIの「最新ユーザー取得」を利用するためのプラグインです。
詳しくは[アツマールAPIリファレンス](https://atsumaru.github.io/api-references/user)を参照してください。

- [プラグイン](https://raw.githubusercontent.com/atsumaru/mv-plugins/master/plugins/AtsumaruGetRecentUsers.js)
- [ソースコード](https://github.com/atsumaru/mv-plugins/blob/master/src/AtsumaruGetRecentUsers.ts)

### AtsumaruGetSelfInformation.js

アツマールAPIの「自身のユーザー情報取得」を利用するためのプラグインです。
詳しくは[アツマールAPIリファレンス](https://atsumaru.github.io/api-references/user)を参照してください。

- [プラグイン](https://raw.githubusercontent.com/atsumaru/mv-plugins/master/plugins/AtsumaruGetSelfInformation.js)
- [ソースコード](https://github.com/atsumaru/mv-plugins/blob/master/src/AtsumaruGetSelfInformation.ts)

### AtsumaruGetUserInformation.js

アツマールAPIの「ユーザー情報取得」を利用するためのプラグインです。
詳しくは[アツマールAPIリファレンス](https://atsumaru.github.io/api-references/user)を参照してください。

- [プラグイン](https://raw.githubusercontent.com/atsumaru/mv-plugins/master/plugins/AtsumaruGetUserInformation.js)
- [ソースコード](https://github.com/atsumaru/mv-plugins/blob/master/src/AtsumaruGetUserInformation.ts)

### AtsumaruGlobalServerVariable.js

アツマールAPIの「グローバルサーバー変数」を利用するためのプラグインです。
詳しくは[アツマールAPIリファレンス](https://atsumaru.github.io/api-references/global-server-variable)を参照してください。

- [プラグイン](https://raw.githubusercontent.com/atsumaru/mv-plugins/master/plugins/AtsumaruGlobalServerVariable.js)
- [ソースコード](https://github.com/atsumaru/mv-plugins/blob/master/src/AtsumaruGlobalServerVariable.ts)

### AtsumaruInterplayerEnable.js

アツマールAPIの「プレイヤー間通信」を有効化するためのプラグインです。
詳しくは[アツマールAPIリファレンス](https://atsumaru.github.io/api-references/common/interplayer)を参照してください。

- [プラグイン](https://raw.githubusercontent.com/atsumaru/mv-plugins/master/plugins/AtsumaruInterplayerEnable.js)
- [ソースコード](https://github.com/atsumaru/mv-plugins/blob/master/src/AtsumaruInterplayerEnable.ts)

### AtsumaruOpenLink.js

アツマールAPIの「外部リンク表示」を利用するためのプラグインです。
詳しくは[アツマールAPIリファレンス](https://atsumaru.github.io/api-references/popup)を参照してください。

- [プラグイン](https://raw.githubusercontent.com/atsumaru/mv-plugins/master/plugins/AtsumaruOpenLink.js)
- [ソースコード](https://github.com/atsumaru/mv-plugins/blob/master/src/AtsumaruOpenLink.ts)

### AtsumaruQuery.js

アツマールAPIの「クエリ取得」を利用するためのプラグインです。
詳しくは[アツマールAPIリファレンス](https://atsumaru.github.io/api-references/copy-query)を参照してください。

- [プラグイン](https://raw.githubusercontent.com/atsumaru/mv-plugins/master/plugins/AtsumaruQuery.js)
- [ソースコード](https://github.com/atsumaru/mv-plugins/blob/master/src/AtsumaruQuery.ts)

### AtsumaruScoreboards.js

アツマールAPIの「スコアボード」を利用するためのプラグインです。
詳しくは[アツマールAPIリファレンス](https://atsumaru.github.io/api-references/scoreboard)を参照してください。

- [プラグイン](https://raw.githubusercontent.com/atsumaru/mv-plugins/master/plugins/AtsumaruScoreboards.js)
- [ソースコード](https://github.com/atsumaru/mv-plugins/blob/master/src/AtsumaruScoreboards.ts)

### AtsumaruScreenshot.js

アツマールAPIの「スクリーンショット撮影」を利用するためのプラグインです。
詳しくは[アツマールAPIリファレンス](https://atsumaru.github.io/api-references/screenshot)を参照してください。

- [プラグイン](https://raw.githubusercontent.com/atsumaru/mv-plugins/master/plugins/AtsumaruScreenshot.js)
- [ソースコード](https://github.com/atsumaru/mv-plugins/blob/master/src/AtsumaruScreenshot.ts)

### AtsumaruSharedSave.js

アツマールAPIの「共有セーブ」を利用するためのプラグインです。
詳しくは[アツマールAPIリファレンス](https://atsumaru.github.io/api-references/shared-save)を参照してください。

- [プラグイン](https://raw.githubusercontent.com/atsumaru/mv-plugins/master/plugins/AtsumaruSharedSave.js)
- [ソースコード](https://github.com/atsumaru/mv-plugins/blob/master/src/AtsumaruSharedSave.ts)

### DetectAtsumaru.js

RPGアツマール環境かどうかを判定し、指定した変数に代入するプラグインです。

- [プラグイン](https://raw.githubusercontent.com/atsumaru/mv-plugins/master/plugins/DetectAtsumaru.js)
- [ソースコード](https://github.com/atsumaru/mv-plugins/blob/master/src/DetectAtsumaru.ts)

## ブラウザやツクールの問題を解決するプラグイン

過去のコアスクリプトでは正常に動かなかった問題を修正するプラグインです。最新のコミュニティ版コアスクリプトにはすべて取り込まれているため、必要ありません。

### ResetTouchInputOnLostFocusFix.js

ゲームがフォーカスを失った時、タッチ入力をリセットするように修正します。
コアスクリプトでは https://github.com/rpgtkoolmv/corescript/pull/184 にて取り込まれています。

- [プラグイン](https://raw.githubusercontent.com/atsumaru/mv-plugins/master/plugins/ResetTouchInputOnLostFocusFix.js)
- [ソースコード](https://github.com/atsumaru/mv-plugins/blob/master/src/ResetTouchInputOnLostFocusFix.ts)

### SafariMovieFix.js

Safariで「サウンド付きメディアは再生しない」設定の場合に、動画を無音で再生するプラグインです。
コアスクリプトでは https://github.com/rpgtkoolmv/corescript/pull/140 にて修正されています。

- [プラグイン](https://raw.githubusercontent.com/atsumaru/mv-plugins/master/plugins/SafariMovieFix.js)
- [ソースコード](https://github.com/atsumaru/mv-plugins/blob/master/src/SafariMovieFix.ts)

### dwango_androidpatch.js

Android Chromeで音が鳴らない問題を解決するプラグインです。
コアスクリプトでは https://github.com/rpgtkoolmv/corescript/pull/33 にて修正されています。

- [プラグイン](https://raw.githubusercontent.com/atsumaru/mv-plugins/master/plugins/dwango_androidpatch.js)
- [ソースコード](https://github.com/atsumaru/mv-plugins/blob/master/src/dwango_androidpatch.ts)

### AtsumaruAutoplayFix.js

すべてのブラウザで自動再生起因による動画再生の失敗を修正するプラグインです。 
コアスクリプトでは https://github.com/rpgtkoolmv/corescript/pull/140 にて修正されています。

- [プラグイン](https://raw.githubusercontent.com/atsumaru/mv-plugins/master/plugins/AtsumaruAutoplayFix.js)
- [ソースコード](https://github.com/atsumaru/mv-plugins/blob/master/src/AtsumaruAutoplayFix.ts)


## その他のプラグイン

### GetGeolocation.js

プレイヤーの位置情報を取得します。

- [プラグイン](https://raw.githubusercontent.com/atsumaru/mv-plugins/master/plugins/GetGeolocation.js)
- [ソースコード](https://github.com/atsumaru/mv-plugins/blob/master/src/GetGeolocation.ts)


# プラグインのビルド

このリポジトリでは、プラグインを構造的に実装するために [TypeScript](https://www.typescriptlang.org/) + [rollup.js](https://rollupjs.org/guide/en) を用いてビルドする構成になっています。もし、あなたがこのリポジトリのプラグインにプルリクエストを送りたい場合、動作確認のためにビルドを試す必要があるでしょう。

## 事前準備
ビルドを行うために、 [node.js](https://nodejs.org/en/) および [yarn](https://yarnpkg.com/ja/) のインストールが必要です。

これらをインストールしたあと、依存パッケージのインストールのために、本リポジトリの直下で以下のコマンドを入力します。

```sh
yarn
```

## ビルド方法
本リポジトリの直下で以下のコマンドを入力します。

```sh
yarn compile
```

ビルド結果は `plugins/` 下に出力されます。

## linterの実行
もしプラグインを修正した場合、 [eslint](https://eslint.org/) のよるコードのチェックを行ってください。RPGアツマールのコード規約にそぐわない記述がないかチェックすることができます。

lintは以下のコマンドで実行できます。

```sh
yarn lint
```

### このリポジトリと@atsumaru/api-typesを一緒に開発し、かつそれをWSL(bash on windows) で開発したい人向けの注意書き

@atsumaru/api-types をyarn link して開発すると一緒に開発できる
この時にyarnコマンドをWSLから使用してはいけない(windows側にあるvscode当のエディタから見て正しくリンクされない)
ちゃんとmingwやpower shellを使いましょう
