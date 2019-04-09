//=============================================================================
// AtsumaruGetRecentUsersExperimental.js
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
                    throw new Error("プラグインパラメータ「" + key + "」には、0～" + ($dataSystem.variable.length - 1) + "までの整数を指定してください。" + key + ": " + variableId);
                }
            }
            return true;
        }; });
    }

    /*:
     * @plugindesc RPGアツマールの最新ユーザーを取得するプラグインです
     * @author RPGアツマール開発チーム
     *
     * @param offset
     * @type variable
     * @text 最新ユーザー(先頭)
     * @desc 最新ユーザーの先頭を代入する変数の番号を指定します。例:201を指定すると変数201番～300番にIDが、301番～400番に名前が代入されます
     * @default 1
     *
     * @param errorMessage
     * @type variable
     * @text エラーメッセージ
     * @desc エラーが発生した場合に、エラーメッセージを代入する変数の番号を指定します。
     * @default 0
     *
     * @help
     * このプラグインは、アツマールAPIの「最新ユーザー取得」を利用するためのプラグインです。
     * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/user)を参照してください。
     *
     * RPGアツマールで、最近このゲームを遊んだプレイヤーをプラグインコマンドで取得します。
     * ・このゲームにおいてプレイヤー間通信を有効化しているプレイヤーのIDと名前を、
     * ・このゲームを最後に（最近）遊んだ順に、
     * ・最大１００人まで
     * 取得することができます。
     *
     * プラグインコマンド:
     *   GetRecentUsers          # 最新ユーザーを取得します
     *   最新ユーザー取得         # コマンド名が日本語のバージョンです。動作は上記コマンドと同じ
     *
     * ユーザーを取得すると、変数1番～100番に新しい順にユーザーIDが代入され、
     * 変数101番～200番にIDに対応するユーザー名が代入されます。
     * ユーザーが100人に満たなかった場合、残りの変数には0が代入されます。
     * （プラグインパラメータ「最新ユーザー(先頭)」を変更することで、代入先をずらすこともできます）
     *
     * アツマール外（テストプレイや他のサイト、ダウンロード版）での挙動:
     *   GetRecentUsers（最新ユーザー取得）
     *     無視される（エラーメッセージにも何も代入されない）
     *
     * ※「並列処理」の中でプラグインコマンドを利用しますと
     *   その時セーブしたセーブデータの状態が不確定になりますので、
     *   可能な限り「並列処理」以外のトリガーでご利用ください。
     */
    var parameters = toTypedParameters(PluginManager.parameters("AtsumaruGetRecentUsersExperimental"));
    var getRecentUsers = window.RPGAtsumaru && window.RPGAtsumaru.experimental && window.RPGAtsumaru.experimental.user && window.RPGAtsumaru.experimental.user.getRecentUsers;
    ensureValidVariableIds(parameters);
    prepareBindPromise();
    addPluginCommand({
        GetRecentUsers: GetRecentUsers,
        "最新ユーザー取得": GetRecentUsers
    });
    function GetRecentUsers() {
        if (getRecentUsers) {
            this.bindPromiseForRPGAtsumaruPlugin(getRecentUsers(), function (recentUsers) {
                for (var i = 0; i < 100; i++) {
                    var user = recentUsers[i];
                    $gameVariables.setValue(parameters.offset + i, user ? user.id : 0);
                    $gameVariables.setValue(parameters.offset + i + 100, user ? user.name : 0);
                }
                $gameVariables.setValue(parameters.errorMessage, 0);
            }, function (error) { return $gameVariables.setValue(parameters.errorMessage, error.message); });
        }
    }

}());
