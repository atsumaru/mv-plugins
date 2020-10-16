//=============================================================================
// WaitCommandUntilPromiseSettled.js
//
// Copyright (c) 2018-2020 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @target MZ
 * @plugindesc 非同期処理が完了するまで、イベントコマンドを待機する機能を提供します
 * @author RPGアツマール開発チーム
 * @url https://atsumaru.github.io/api-references/
 *
 * @help
 * ゲーム作者向け説明：
 * このプラグインは、プラグインを作成するために便利な機能を提供します。
 * 単体では特に何も効果を発揮しません。
 * 他のプラグインを導入したとき、このプラグインが必要と表示されたら一緒に導入してください。
 *
 *
 * プラグイン作者向け説明：
 * このプラグインは、プラグインコマンド内で非同期処理を実行したときに
 * その処理が完了するまでイベントコマンドがウェイトする（次に進まないようにする）機能を提供します。
 *
 * 非同期処理とは、完了までに時間がかかる処理のことです。
 * Web上ではサーバーとの通信などで時間がかかることが多いため、この非同期処理が頻出します。
 * JavaScriptでは、非同期処理はPromiseオブジェクトの形で表されます。
 * 逆に言うと、本プラグインにとって未想定の非同期処理でも、Promiseオブジェクトの形にさえ変換すれば待機処理できます。
 * Promiseオブジェクトについて詳しくは、MDNの記事をご参照ください。
 * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise
 *
 * 使い方：
 *
 * PluginManager.registerCommand("somePlugin", "someCommand", function(args) {
 *     this.waitUntilPromiseSettled(somePromise(args), result => { ... }, error => { ... });
 * });
 *
 * 上のように、プラグインコマンド登録処理の内部からthis.waitUntilPromiseSettledという関数が利用可能になります。
 * この関数の第１引数にPromiseオブジェクトを指定すると、
 * そのPromiseオブジェクトが完了（成功または失敗）するまでイベントコマンドの進行が待機されます。
 * また、第２，第３引数には関数を指定することができ、Promiseオブジェクトの結果を受け取れます。
 * 成功すると第２引数の関数が実行され、引数resultには成功結果が格納されています。
 * 失敗すると第３引数の関数が実行され、引数errorには失敗の原因であるErrorオブジェクトが格納されています。
 *
 * 詳細仕様（気になる人向け）：
 * 非同期処理の待機中は該当のプラグインコマンドで待機し、処理に成功または失敗した時にPromiseの続きを解決します。
 * このタイミングまで遅延することで、以下のようなメリットが生まれます。
 * １．解決が次のコマンドの直前なので、他の並列処理に結果を上書きされない
 * ２．ゲームループ内でエラーが発生するので、エラー発生箇所とスタックトレースが自然に詳細化される
 * ３．ソフトリセット後、リセット前のexecuteCommandは叩かれなくなるので、
 *     リセット前のPromiseの後続がリセット後のグローバルオブジェクトを荒らす事故がなくなる
 */

Game_Interpreter.prototype.waitUntilPromiseSettled = function(promise, resolve, reject) {
    this._index--;
    this._promiseResolver = () => false;
    promise.then(
        value => this._promiseResolver = () => {
            this._index++;
            delete this._promiseResolver;
            if (resolve) {
                resolve(value);
            }
            return true;
        },
        error => this._promiseResolver = () => {
            console.error(error.message);
            console.error(error.stack);
            this._index++;
            delete this._promiseResolver;
            if (reject) {
                reject(error);
            }
            return true;
        }
    );
};

{
    const _Game_Interpreter_executeCommand = Game_Interpreter.prototype.executeCommand;
    Game_Interpreter.prototype.executeCommand = function() {
        if (this._promiseResolver) {
            const resolved = this._promiseResolver();
            if (!resolved) {
                return false;
            }
        }
        return _Game_Interpreter_executeCommand.apply(this, arguments);
    };
}
