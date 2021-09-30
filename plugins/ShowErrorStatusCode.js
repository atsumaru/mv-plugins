//=============================================================================
// ShowErrorStatusCode.js
//
// Copyright (c) 2018-2021 ゲームアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

(function () {
    'use strict';

    /*:
     * @plugindesc 読み込みエラー時にHTTPステータスコードを表示するプラグインです
     * @author RPGアツマール開発チーム
     *
     * @help
     * 読み込みエラー時に、Loading Error(404)のようにHTTPステータスコードを表示します。
     * この数値の意味を解釈するとエラーの原因がわかります。
     * このプラグインは、RPGツクールMV コアスクリプトv1.5.0以上で動作します。（アツマール版コアスクリプトでもOK）
     *
     * HTTPステータスコード解説（よく出るもののみ）
     *
     * 404
     * ファイルが見つかりませんでした。
     * 素材ファイルを入れ忘れていないか、ファイル名の指定を間違えていないかご確認ください。
     *
     * 500～599
     * サーバーでエラーが発生しました。
     * そのサーバーの管理者に連絡して、不調を復旧してもらってください。
     *
     * 0
     * 通信が切断されました。
     * 電波状況（スマホなら圏外でないか、PCならインターネットの線が抜けてないかなど）を確認してください。
     *
     * offline
     * そもそもインターネット接続を用いていないので、HTTPステータスコードがわかりません。
     * テストプレイ時や、PC版としてゲームを公開した場合のエラーはすべてこちらになります。
     * ただ順当に考えれば、やはりファイルが存在しない(404)ものと思われます。
     */
    Graphics.printLoadingError = function (url) {
        if (this._errorPrinter && !this._errorShowed) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            try {
                xhr.send();
            }
            catch (_a) {
                // none
            }
            var errorCode = Utils.isNwjs() ? "offline" : xhr.status;
            if (errorCode === 404) {
                errorCode = "404:このファイルは存在しません";
            }
            else if (errorCode >= 500) {
                errorCode = errorCode + ":サーバー管理者に連絡してください";
            }
            else if (errorCode === 0) {
                errorCode = "0:通信状況を確認してください";
            }
            else if (errorCode === "offline") {
                errorCode = "offline:このファイルは存在しない可能性が高いです";
            }
            this._errorPrinter.innerHTML = this._makeErrorHtml("Loading Error(" + errorCode + ")", "Failed to load: " + url);
            var button = document.createElement("button");
            button.innerHTML = "Retry";
            button.style.fontSize = "24px";
            button.style.color = "#ffffff";
            button.style.backgroundColor = "#000000";
            button.onmousedown = button.ontouchstart = function (event) {
                ResourceHandler.retry();
                event.stopPropagation();
            };
            this._errorPrinter.appendChild(button);
            this._loadingCount = -Infinity;
        }
    };

}());
