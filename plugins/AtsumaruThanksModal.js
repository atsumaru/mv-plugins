//=============================================================================
// AtsumaruThanksModal.js
//
// Copyright (c) 2018-2021 ゲームアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

(function () {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __spreadArray(to, from) {
        for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
            to[j] = from[i];
        return to;
    }

    // 既存のクラスとメソッド名を取り、そのメソッドに処理を追加する
    function hook(baseClass, target, f) {
        baseClass.prototype[target] = f(baseClass.prototype[target]);
    }
    // プラグインコマンドを追加する
    function addPluginCommand(commands) {
        hook(Game_Interpreter, "pluginCommand", function (origin) { return function (command, args) {
            origin.apply(this, arguments);
            if (commands[command]) {
                commands[command].apply(this, __spreadArray([command], args));
            }
        }; });
    }
    // Promiseが終了するまでイベントコマンドをウェイトするための処理を追加する
    function prepareBindPromise() {
        if (!!Game_Interpreter.prototype.bindPromiseForRPGAtsumaruPlugin) {
            return;
        }
        // Promiseを実行しつつ、それをツクールのインタプリタと結びつけて解決されるまで進行を止める
        Game_Interpreter.prototype.bindPromiseForRPGAtsumaruPlugin = function (promise, resolve, reject) {
            var _this = this;
            this._index--;
            this._promiseResolverForRPGAtsumaruPlugin = function () { return false; };
            promise.then(function (value) { return _this._promiseResolverForRPGAtsumaruPlugin = function () {
                _this._index++;
                delete _this._promiseResolverForRPGAtsumaruPlugin;
                if (resolve) {
                    resolve(value);
                }
                return true;
            }; }, function (error) { return _this._promiseResolverForRPGAtsumaruPlugin = function () {
                for (var key in _this._eventInfo) {
                    error[key] = _this._eventInfo[key];
                }
                error.line = _this._index + 1;
                error.eventCommand = "plugin_command";
                error.content = _this._params[0];
                switch (error.code) {
                    case "BAD_REQUEST":
                        throw error;
                    case "UNAUTHORIZED":
                    case "FORBIDDEN":
                    case "INTERNAL_SERVER_ERROR":
                    case "API_CALL_LIMIT_EXCEEDED":
                    default:
                        console.error(error.code + ": " + error.message);
                        console.error(error.stack);
                        if (Graphics._showErrorDetail && Graphics._formatEventInfo && Graphics._formatEventCommandInfo) {
                            var eventInfo = Graphics._formatEventInfo(error);
                            var eventCommandInfo = Graphics._formatEventCommandInfo(error);
                            console.error(eventCommandInfo ? eventInfo + ", " + eventCommandInfo : eventInfo);
                        }
                        _this._index++;
                        delete _this._promiseResolverForRPGAtsumaruPlugin;
                        if (reject) {
                            reject(error);
                        }
                        return true;
                }
            }; });
        };
        // 通信待機中はこのコマンドで足踏みし、通信に成功または失敗した時にPromiseの続きを解決する
        // このタイミングまで遅延することで、以下のようなメリットが生まれる
        // １．解決が次のコマンドの直前なので、他の並列処理に結果を上書きされない
        // ２．ゲームループ内でエラーが発生するので、エラー発生箇所とスタックトレースが自然に詳細化される
        // ３．ソフトリセット後、リセット前のexecuteCommandは叩かれなくなるので、
        //     リセット前のPromiseのresolverがリセット後のグローバルオブジェクトを荒らす事故がなくなる
        hook(Game_Interpreter, "executeCommand", function (origin) { return function () {
            if (this._promiseResolverForRPGAtsumaruPlugin) {
                var resolved = this._promiseResolverForRPGAtsumaruPlugin();
                if (!resolved) {
                    return false;
                }
            }
            return origin.apply(this, arguments);
        }; });
    }

    function toTypedParameters(parameters, isArray) {
        if (isArray === void 0) { isArray = false; }
        var result = isArray ? [] : {};
        for (var key in parameters) {
            try {
                var value = JSON.parse(parameters[key]);
                result[key] = value instanceof Array ? toTypedParameters(value, true)
                    : value instanceof Object ? toTypedParameters(value)
                        : value;
            }
            catch (error) {
                result[key] = parameters[key];
            }
        }
        return result;
    }

    /*:
     * @plugindesc ゲームアツマールのおれいポップアップAPI操作のためのプラグインです
     * @author ゲームアツマール開発チーム
     *
     * @param autoThanks
     * @type boolean
     * @text 自動表示
     * @desc おれいポップアップを一定時間経過後に自動で表示するかどうか設定します。
     * @default true
     *
     * @param thanksText
     * @type note
     * @text おれい文章
     * @desc おれいポップアップに表示される作者からのメッセージを指定します。
     *
     * @param thanksImage
     * @type file
     * @dir img/pictures
     * @require 1
     * @text おれい画像
     * @desc おれいポップアップに表示されるピクチャーを指定します。
     *
     * @param clapThanksText
     * @type note
     * @text 拍手おれい文章
     * @desc 拍手されたときにおれいポップアップに表示される作者からのメッセージを指定します。
     *
     * @param clapThanksImage
     * @type file
     * @dir img/pictures
     * @require 1
     * @text 拍手おれい画像
     * @desc 拍手されたときにおれいポップアップに表示されるピクチャーを指定します。
     *
     * @param giftThanksText
     * @type note
     * @text ギフトおれい文章
     * @desc ギフトされたときにおれいポップアップに表示される作者からのメッセージを指定します。
     *
     * @param giftThanksImage
     * @type file
     * @dir img/pictures
     * @require 1
     * @text ギフトおれい画像
     * @desc ギフトされたときにおれいポップアップに表示されるピクチャーを指定します。
     *
     * @help
     * このプラグインは、アツマールAPIの「おれいポップアップ」を利用するためのプラグインです。
     * 「おれいポップアップ」は作者がプレイヤーに感謝の気持ちを伝えられる機能であり、
     * プレイヤーはその気持ちを受け取って、『拍手』や『ギフト』で御礼と返事をすることが可能な機能です。
     * プラグインパラメータにより、おれいポップアップに表示する文章や画像を変更できます。
     * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/thanks-modal)を参照してください。
     *
     * プラグインコマンド:
     *   DisplayThanksModal        # おれいポップアップを表示します
     *   おれいポップアップ表示        # コマンド名が日本語のバージョンです。動作は上記コマンドと同じ
     */
    var parameters = toTypedParameters(PluginManager.parameters("AtsumaruThanksModal"));
    var displayThanksModal = window.RPGAtsumaru && window.RPGAtsumaru.popups.displayThanksModal;
    var setThanksSettings = window.RPGAtsumaru && window.RPGAtsumaru.popups.setThanksSettings;
    if (setThanksSettings) {
        for (var key in parameters) {
            var value = parameters[key];
            if (value) {
                if (key.indexOf("Image") >= 0) {
                    parameters[key] = "img/pictures/" + value + ".png";
                }
            }
            else {
                delete parameters[key];
            }
        }
        setThanksSettings(parameters);
    }
    prepareBindPromise();
    addPluginCommand({
        DisplayThanksModal: DisplayThanksModal,
        "おれいポップアップ表示": DisplayThanksModal
    });
    function DisplayThanksModal() {
        if (displayThanksModal) {
            this.bindPromiseForRPGAtsumaruPlugin(displayThanksModal());
        }
    }

}());
