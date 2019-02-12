//=============================================================================
// AtsumaruGlobalServerVariableExperimental.js
//
// Copyright (c) 2018 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
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

    function toDefined(value, command, name) {
        if (value === undefined) {
            throw new Error("「" + command + "」コマンドでは、" + name + "を指定してください。");
        }
        else {
            return value;
        }
    }
    function toInteger(value, command, name) {
        value = toDefined(value, command, name);
        var number = +value;
        if (isNumber(value) && isInteger(number)) {
            return number;
        }
        else {
            throw new Error("「" + command + "」コマンドでは、" + name + "には整数を指定してください。" + name + ": " + value);
        }
    }
    function toNatural(value, command, name) {
        value = toDefined(value, command, name);
        var number = +value;
        if (isNumber(value) && isNatural(number)) {
            return number;
        }
        else {
            throw new Error("「" + command + "」コマンドでは、" + name + "には自然数を指定してください。" + name + ": " + value);
        }
    }
    function toValidVariableIdOrUndefined(value, command, name) {
        if (value === undefined) {
            return value;
        }
        var number = +value;
        if (isNumber(value) && isValidVariableId(number)) {
            return number;
        }
        else {
            throw new Error("「" + command + "」コマンドでは、" + name + "を指定する場合は1～" + ($dataSystem.variables.length - 1) + "までの整数を指定してください。" + name + ": " + value);
        }
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
     * @plugindesc RPGアツマールのグローバルサーバー変数のための(Experimental版)プラグインです
     * @author RPGアツマール開発チーム
     *
     * @param value
     * @type variable
     * @text 現在値
     * @desc グローバルサーバー変数の取得時に、現在値を代入する変数の番号を指定します。
     * @default 0
     *
     * @param minValue
     * @type variable
     * @text 最小値
     * @desc グローバルサーバー変数の取得時に、最小値を代入する変数の番号を指定します。
     * @default 0
     *
     * @param maxValue
     * @type variable
     * @text 最大値
     * @desc グローバルサーバー変数の取得時に、最大値を代入する変数の番号を指定します。
     * @default 0
     *
     * @param name
     * @type variable
     * @text 変数名
     * @desc グローバルサーバー変数の取得時に、変数名を代入する変数の番号を指定します。
     * @default 0
     *
     * @param errorMessage
     * @type variable
     * @text エラーメッセージ
     * @desc エラーが発生した場合に、エラーメッセージを代入する変数の番号を指定します。
     * @default 0
     *
     * @help
     * このプラグインは、アツマールAPIの「グローバルサーバー変数」を利用するためのプラグインです。
     * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/global-server-variable)を参照してください。
     *
     * プラグインコマンド（英語版と日本語版のコマンドがありますが、どちらも同じ動作です）:
     *   TriggerCall <triggerId>
     *   トリガー発動 <triggerId>
     *      # 指定した<triggerId>の「ゲーム内から実行」型トリガーを発動させる
     *      # 例: TriggerCall 1
     *      #   : トリガー発動 1
     *
     *   TriggerCall <triggerId> <deltaVariableId>
     *   トリガー発動 <triggerId> <deltaVariableId>
     *     # 変数<deltaVariableId>から増減値を読み取り、指定した<triggerId>の「ゲーム内で増減値を指定して実行」型トリガーを発動させる
     *     # 例: TriggerCall 1 5
     *     #   : トリガー発動 1 5
     *
     *   GetGlobalServerVariable <globalServerVariableId>
     *   グローバルサーバー変数取得 <globalServerVariableId>
     *      # グローバルサーバー変数<globalServerVariableId>の情報（現在値・最小値・最大値・変数名）を読み込み、
     *          プラグインパラメータで指定した変数に値をセットする。
     *      # 例: GetGlobalServerVariable 1 2
     *      #   : グローバルサーバー変数取得 1 2
     *
     * アツマール外（テストプレイや他のサイト、ダウンロード版）での挙動:
     *      TriggerCall（トリガー発動）
     *          無視される（エラーメッセージにも何も代入されない）
     *      GetGlobalServerVariable（グローバルサーバー変数取得）
     *          無視される（エラーメッセージにも何も代入されない）
     */
    var parameters = toTypedParameters(PluginManager.parameters("AtsumaruGlobalServerVariableExperimental"));
    var globalServerVariable = window.RPGAtsumaru && window.RPGAtsumaru.experimental && window.RPGAtsumaru.experimental.globalServerVariable;
    var triggerCall = globalServerVariable && globalServerVariable.triggerCall;
    var getGlobalServerVariable = globalServerVariable && globalServerVariable.getGlobalServerVariable;
    ensureValidVariableIds(parameters);
    prepareBindPromise();
    addPluginCommand({
        TriggerCall: TriggerCall,
        "トリガー発動": TriggerCall,
        GetGlobalServerVariable: GetGlobalServerVariable,
        "グローバルサーバー変数取得": GetGlobalServerVariable
    });
    function TriggerCall(command, triggerIdStr, deltaVariableIdStr) {
        var triggerId = toNatural(triggerIdStr, command, "triggerId");
        var deltaVariableId = toValidVariableIdOrUndefined(deltaVariableIdStr, command, "deltaVariableId");
        if (triggerCall) {
            if (deltaVariableId === undefined) {
                this.bindPromiseForRPGAtsumaruPlugin(triggerCall(triggerId), function () { return $gameVariables.setValue(parameters.errorMessage, 0); }, function (error) { return $gameVariables.setValue(parameters.errorMessage, error.message); });
            }
            else {
                var delta = toInteger($gameVariables.value(deltaVariableId), command, "delta");
                this.bindPromiseForRPGAtsumaruPlugin(triggerCall(triggerId, delta), function () { return $gameVariables.setValue(parameters.errorMessage, 0); }, function (error) { return $gameVariables.setValue(parameters.errorMessage, error.message); });
            }
        }
    }
    function GetGlobalServerVariable(command, globalServerVariableIdStr) {
        var globalServerVariableId = toNatural(globalServerVariableIdStr, command, "globalServerVariableId");
        if (getGlobalServerVariable) {
            this.bindPromiseForRPGAtsumaruPlugin(getGlobalServerVariable(globalServerVariableId), function (globalServerVariable) {
                $gameVariables.setValue(parameters.value, globalServerVariable.value);
                $gameVariables.setValue(parameters.minValue, globalServerVariable.minValue);
                $gameVariables.setValue(parameters.maxValue, globalServerVariable.maxValue);
                $gameVariables.setValue(parameters.name, globalServerVariable.name);
                $gameVariables.setValue(parameters.errorMessage, 0);
            }, function (error) { return $gameVariables.setValue(parameters.errorMessage, error.message); });
        }
    }

}());
