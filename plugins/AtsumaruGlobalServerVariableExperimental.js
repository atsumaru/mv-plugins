//=============================================================================
// AtsumaruGlobalServerVariableExperimental.js
//
// Copyright (c) 2018 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

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
 * このプラグインは、アツマールAPIのグローバルサーバー変数を利用するためのプラグインです。
 * 詳しくはアツマールAPIリファレンス()を参照してください。
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
(function() {
    "use strict";
    function isInteger(value) {
        return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
    }

    function isNatural(value) {
        return isInteger(value) && value > 0;
    }

    function isValidVariableId(variableId) {
        return isNatural(variableId) && variableId < $dataSystem.variables.length;
    }

    var pluginName = "AtsumaruGlobalServerVariableExperimental";
    var parameters = PluginManager.parameters(pluginName);
    var errorMessage = Number(parameters["errorMessage"]);
    var globalServerVariableDefined = window.RPGAtsumaru && window.RPGAtsumaru.experimental.globalServerVariable;
    var triggerCallDefined = globalServerVariableDefined && window.RPGAtsumaru.experimental.globalServerVariable.triggerCall;
    var getGlobalServerVariableDefined = globalServerVariableDefined && window.RPGAtsumaru.experimental.globalServerVariable.getGlobalServerVariable;
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        var variableMax = $dataSystem.variables.length - 1;
        var that = this;
        if (command === "TriggerCall" || command === "トリガー発動") {
            var triggerId = Number(args[0]);
            var deltaVariableId = Number(args[1]);

            if (!isNatural(triggerId)) {
                throw new Error("「" + command + "」コマンドでは、triggerIdには自然数を指定してください。 triggerId: " + args[0]);
            }
            if (args[1] !== undefined) {
                if (!isValidVariableId(deltaVariableId)) {
                    throw new Error("「" + command + "」コマンドでは、deltaVariableIdには1～" + variableMax + "までの整数を指定してください。 deltaVariableId: " + args[1]);
                }
                var delta = Number($gameVariables.value(deltaVariableId));
                if (!isInteger(delta)) {
                    throw new Error("「" + command + "」コマンドでは、増減値には整数を指定してください。 delta: " + delta);
                }
            }

            if (triggerCallDefined) {
                this._waitForGlobalServerVariablePlugin = true;
                var result;
                if (delta === undefined) {
                    result = window.RPGAtsumaru.experimental.globalServerVariable.triggerCall(triggerId);
                } else {
                    result = window.RPGAtsumaru.experimental.globalServerVariable.triggerCall(triggerId, delta);
                }
                result.then(function() {
                    that._waitForGlobalServerVariablePlugin = false;
                    $gameVariables.setValue(errorMessage, 0);
                }, function(error) {
                    switch (error.code) {
                    case "BAD_REQUEST":
                        SceneManager.catchException(error);
                        break;
                    case "INTERNAL_SERVER_ERROR":
                    default:
                        that._waitForGlobalServerVariablePlugin = false;
                        var message = error.message;
                        if (message.length > 27) {
                            message = message.slice(0, 27) + "\n" + message.slice(27);
                        }
                        $gameVariables.setValue(errorMessage, message);
                        console.error(error);
                        break;
                    }
                });
            }
        } else if (command === "GetGlobalServerVariable" || command === "グローバルサーバー変数取得") {
            var globalServerVariableId = Number(args[0]);
            if (!isNatural(globalServerVariableId)) {
                throw new Error("「" + command + "」コマンドでは、globalServerVariableIdには自然数を指定してください。 globalServerVariableId: " + args[0]);
            }

            if (getGlobalServerVariableDefined) {
                this._waitForGlobalServerVariablePlugin = true;
                window.RPGAtsumaru.experimental.globalServerVariable.getGlobalServerVariable(globalServerVariableId).then(function(globalServerVariable) {
                    that._waitForGlobalServerVariablePlugin = false;
                    for (var key in parameters) {
                        if (typeof globalServerVariable[key] !== "string") {
                            globalServerVariable[key] = Number(globalServerVariable[key]);
                        }
                        $gameVariables.setValue(parameters[key], globalServerVariable[key]);
                    }
                }, function(error) {
                    switch (error.code) {
                    case "BAD_REQUEST":
                        SceneManager.catchException(error);
                        break;
                    case "INTERNAL_SERVER_ERROR":
                    default:
                        that._waitForGlobalServerVariablePlugin = false;
                        var message = error.message;
                        if (message.length > 27) {
                            message = message.slice(0, 27) + "\n" + message.slice(27);
                        }
                        $gameVariables.setValue(errorMessage, message);
                        console.error(error);
                        break;
                    }
                });
            }
        }
    };

    var _Game_Interpreter_updateWait = Game_Interpreter.prototype.updateWait;
    Game_Interpreter.prototype.updateWait = function() {
        var result = _Game_Interpreter_updateWait.apply(this, arguments);
        return result || Boolean(this._waitForGlobalServerVariablePlugin);
    };
})();
