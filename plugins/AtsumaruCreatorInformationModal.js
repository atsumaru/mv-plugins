//=============================================================================
// AtsumaruCreatorInformationModal.js
//
// Copyright (c) 2018-2020 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

(function () {
    'use strict';

    function isNumber(value) {
        return value !== "" && !isNaN(value);
    }
    function isInteger(value) {
        return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
    }
    function isNatural(value) {
        return isInteger(value) && value > 0;
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
                commands[command].apply(this, [command].concat(args));
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

    function toNaturalOrUndefined(value, command, name) {
        if (value === undefined) {
            return value;
        }
        var number = +value;
        if (isNumber(value) && isNatural(number)) {
            return number;
        }
        else {
            throw new Error("「" + command + "」コマンドでは、" + name + "を指定する場合は自然数を指定してください。" + name + ": " + value);
        }
    }

    /*:
     * @plugindesc RPGアツマールの作者情報ダイアログAPI操作のためのプラグインです
     * @author RPGアツマール開発チーム
     *
     * @help
     * このプラグインは、アツマールAPIの「作者情報ダイアログ」を利用するためのプラグインです。
     * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/creator-modal)を参照してください。
     *
     * プラグインコマンド:
     *   DisplayCreatorInformationModal <niconicoUserId>        # 指定した<niconicoUserId>の作者情報ダイアログを表示します。省略した場合は現在のゲームの作者の作者情報ダイアログを表示します。
     *   作者情報ダイアログ表示 <niconicoUserId>        # コマンド名が日本語のバージョンです。動作は上記コマンドと同じ
     */
    var displayCreatorInformationModal = window.RPGAtsumaru && window.RPGAtsumaru.popups.displayCreatorInformationModal;
    prepareBindPromise();
    addPluginCommand({
        DisplayCreatorInformationModal: DisplayCreatorInformationModal,
        "作者情報ダイアログ表示": DisplayCreatorInformationModal
    });
    function DisplayCreatorInformationModal(command, niconicoUserIdStr) {
        var niconicoUserId = toNaturalOrUndefined(niconicoUserIdStr, command, "niconicoUserId");
        if (displayCreatorInformationModal) {
            if (niconicoUserId === undefined) {
                this.bindPromiseForRPGAtsumaruPlugin(displayCreatorInformationModal());
            }
            else {
                this.bindPromiseForRPGAtsumaruPlugin(displayCreatorInformationModal(niconicoUserId));
            }
        }
    }

}());
