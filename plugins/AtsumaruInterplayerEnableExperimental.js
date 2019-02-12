//=============================================================================
// AtsumaruInterplayerEnableExperimental.js
//
// Copyright (c) 2018 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
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
                commands[command].apply(this, [command].concat(args));
            }
        }; });
    }
    // Promiseが終了するまでイベントコマンドをウェイトするための処理を追加する
    function prepareBindPromise() {
        if (Game_Interpreter.prototype.bindPromiseForRPGAtsumaruPlugin) {
            return;
        }
        // ソフトリセットのタイミングでローディングカウンターを初期化
        hook(Game_Temp, "initialize", function (origin) { return function () {
            origin.apply(this, arguments);
            this._loadingCounterForRPGAtsumaruPlugin = 0;
        }; });
        // 通信中のセーブは許可しない。ハードリセットしてロードした後、
        // その通信がどんな結果だったのか、成功したか失敗したかなどを復元する方法はもはやないため
        hookStatic(DataManager, "saveGame", function (origin) { return function () {
            return $gameTemp._loadingCounterForRPGAtsumaruPlugin === 0 && origin.apply(this, arguments);
        }; });
        // Promiseを実行しつつ、それをツクールのインタプリタと結びつけて解決されるまで進行を止める
        Game_Interpreter.prototype.bindPromiseForRPGAtsumaruPlugin = function (promise, resolve, reject) {
            var _this = this;
            var $gameTempLocal = $gameTemp;
            $gameTempLocal._loadingCounterForRPGAtsumaruPlugin++;
            this._index--;
            this._promiseResolverForRPGAtsumaruPlugin = function () { return false; };
            promise.then(function (value) { return _this._promiseResolverForRPGAtsumaruPlugin = function () {
                $gameTempLocal._loadingCounterForRPGAtsumaruPlugin--;
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
                        $gameTempLocal._loadingCounterForRPGAtsumaruPlugin--;
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
                    throw new Error("プラグインパラメータ「" + key + "」には、0～" + ($dataSystem.variable.length - 1) + "までの整数を指定してください。" + key + ": " + variableId);
                }
            }
            return true;
        }; });
    }

    /*:
     * @plugindesc RPGアツマールのプレイヤー間通信を有効化するプラグインです
     * @author RPGアツマール開発チーム
     *
     * @param errorMessage
     * @type variable
     * @text エラーメッセージ
     * @desc エラーが発生した場合に、エラーメッセージを代入する変数の番号を指定します。
     * @default 0
     *
     * @help
     * このプラグインは、アツマールAPIの「プレイヤー間通信」を有効化するためのプラグインです。
     * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/common/interplayer)を参照してください。
     *
     * RPGアツマールのプレイヤー間通信をプラグインコマンドで有効化します。
     * 有効化したプレイヤーは、このゲーム内において以下のような機能が有効になります。
     * ・共有セーブやユーザー情報を他人が読み取れるようになる
     * ・他人から送信されたユーザーシグナルを受信できるようになる
     * ・「このゲームをプレイヤーした最新ユーザーリスト」に登録されるようになる
     *
     * プラグインコマンド:
     *   EnableInterplayer          # プレイヤー間通信を有効化します
     *   プレイヤー間通信有効化         # コマンド名が日本語のバージョンです。動作は上記コマンドと同じ
     *
     * アツマール外（テストプレイや他のサイト、ダウンロード版）での挙動:
     *   EnableInterplayer（プレイヤー間通信有効化）
     *     無視される（エラーメッセージにも何も代入されない）
     */
    var parameters = toTypedParameters(PluginManager.parameters("AtsumaruEnableInterplayerExperimental"));
    var enableInterplayer = window.RPGAtsumaru && window.RPGAtsumaru.experimental && window.RPGAtsumaru.experimental.interplayer && window.RPGAtsumaru.experimental.interplayer.enable;
    ensureValidVariableIds(parameters);
    prepareBindPromise();
    addPluginCommand({
        EnableInterplayer: EnableInterplayer,
        "プレイヤー間通信有効化": EnableInterplayer
    });
    function EnableInterplayer() {
        if (enableInterplayer) {
            this.bindPromiseForRPGAtsumaruPlugin(enableInterplayer(), function () { return $gameVariables.setValue(parameters.errorMessage, 0); }, function (error) { return $gameVariables.setValue(parameters.errorMessage, error.message); });
        }
    }

}());
