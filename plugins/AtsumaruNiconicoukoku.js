//=============================================================================
// AtsumaruNiconicoukoku.js
//
// Copyright (c) 2018-2021 ゲームアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

(function () {
    'use strict';

    function isInteger(value) {
        return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
    }
    function isNatural(value) {
        return isInteger(value) && value > 0;
    }
    function isValidVariableId(variableId) {
        return isNatural(variableId) && variableId < $dataSystem.variables.length;
    }

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
    function hookStatic(baseClass, target, f) {
        baseClass[target] = f(baseClass[target]);
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
    function ensureValidVariableIds(parameters) {
        hookStatic(DataManager, "isDatabaseLoaded", function (origin) { return function () {
            if (!origin.apply(this, arguments)) {
                return false;
            }
            for (var key in parameters) {
                var variableId = parameters[key];
                if (variableId !== 0 && !isValidVariableId(variableId)) {
                    throw new Error("プラグインパラメータ「" + key + "」には、0～" + ($dataSystem.variables.length - 1) + "までの整数を指定してください。" + key + ": " + variableId);
                }
            }
            return true;
        }; });
    }

    /*:
     * @plugindesc RPGアツマールでニコニ広告ポイントを取得するプラグインです
     * @author RPGアツマール開発チーム
     *
     * @param activePoint
     * @type variable
     * @text アクティブポイント
     * @desc 広告期間以内の広告ポイントを代入する変数の番号を指定します。
     * @default 0
     *
     * @param totalPoint
     * @type variable
     * @text トータルポイント
     * @desc 累計の広告ポイントを代入する変数の番号を指定します。
     * @default 0
     *
     * @param errorMessage
     * @type variable
     * @text エラーメッセージ
     * @desc エラーが発生した場合に、エラーメッセージを代入する変数の番号を指定します。
     * @default 0
     *
     * @help
     * このプラグインは、アツマールAPIの「ニコニ広告ポイント取得」を利用するためのプラグインです。
     * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/nicoad)を参照してください。
     *
     * プラグインコマンド:
     *   GetNicoadPoints         # ニコニ広告ポイント（アクティブポイントとトータルポイント）を取得する
     *   ニコニ広告ポイント取得         # コマンド名が日本語のバージョンです。動作は上記コマンドと同じ
     */
    var parameters = toTypedParameters(PluginManager.parameters("AtsumaruNiconicoukoku"));
    var getPoints = window.RPGAtsumaru && window.RPGAtsumaru.nicoad.getPoints;
    ensureValidVariableIds(parameters);
    prepareBindPromise();
    addPluginCommand({
        GetNicoadPoints: GetNicoadPoints,
        ニコニ広告ポイント取得: GetNicoadPoints
    });
    function GetNicoadPoints() {
        if (getPoints) {
            this.bindPromiseForRPGAtsumaruPlugin(getPoints(), function (_a) {
                var activePoint = _a.activePoint, totalPoint = _a.totalPoint;
                $gameVariables.setValue(parameters.activePoint, activePoint);
                $gameVariables.setValue(parameters.totalPoint, totalPoint);
                $gameVariables.setValue(parameters.errorMessage, 0);
            }, function (error) { return $gameVariables.setValue(parameters.errorMessage, error.message); });
        }
    }

}());
