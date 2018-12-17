//=============================================================================
// AtsumaruGetUserInformationExperimental.js
//
// Copyright (c) 2018 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc RPGアツマールの特定ユーザーの情報を取得するAPIのための(Experimental版)プラグインです
 * @author RPGアツマール開発チーム
 *
 * @param name
 * @type variable
 * @text ユーザー名
 * @desc ユーザー情報取得時に、ユーザー名を代入する変数の番号を指定します。
 * @default 0
 *
 * @param profile
 * @type variable
 * @text 自己紹介
 * @desc ユーザー情報取得時に、自己紹介を代入する変数の番号を指定します。
 * @default 0
 *
 * @param twitterId
 * @type variable
 * @text TwitterID
 * @desc ユーザー情報取得時に、TwitterIDを代入する変数の番号を指定します。
 * @default 0
 *
 * @param url
 * @type variable
 * @text ウェブサイト
 * @desc ユーザー情報取得時に、ウェブサイトを代入する変数の番号を指定します。
 * @default 0
 *
 * @param errorMessage
 * @type variable
 * @text エラーメッセージ
 * @desc エラーが発生した場合に、エラーメッセージを代入する変数の番号を指定します。
 * @default 0
 *
 * @help
 * RPGアツマールで、指定したユーザーのプロフィールなどの情報を取得します。
 * 
 * プラグインコマンド（英語版と日本語版のコマンドがありますが、どちらも同じ動作です）:
 *   GetUserInformation <userIdVariableId>
 *   特定ユーザー取得 <userIdVariableId>
 *      # 変数<userIdVariableId>からユーザーIDを読み取り、そのユーザーの情報を取得します。
 *      # 取得した情報は、プラグインパラメータで指定した変数IDに代入されます。
 *      # もしも情報が取得できなかった場合は、エラーメッセージが代入されます。
 * 
 * アツマール外（テストプレイや他のサイト、ダウンロード版）での挙動:
 *      GetUserInformation（特定ユーザー取得）
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

    var pluginName = "AtsumaruGetUserInformationExperimental";
    var parameters = PluginManager.parameters(pluginName);
    var userDefined = window.RPGAtsumaru && window.RPGAtsumaru.experimental.user;
    var getUserInformationDefined = userDefined && window.RPGAtsumaru.experimental.user.getUserInformation;

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        var variableMax = $dataSystem.variables.length - 1;
        var that = this;
        if (command === "GetUserInformation" || command === "特定ユーザー取得") {
            var userIdVariableId = Number(args[0]);
            if (!isValidVariableId(userIdVariableId)) {
                throw new Error("「" + command + "」コマンドでは、userIdVariableIdには1～" + variableMax + "までの整数を指定してください。 userIdVariableId: " + args[0]);
            }
            var userId = Number($gameVariables.value(userIdVariableId));
            if (!isNatural(userId)) {
                throw new Error("「" + command + "」コマンドでは、ユーザーIDには自然数を指定してください。 userId: " + userId);
            }
            if (getUserInformationDefined) {
                this._waitForGetUserInformationPlugin = true;
                window.RPGAtsumaru.experimental.user.getUserInformation(userId).then(function(userInformation) {
                    that._waitForGetUserInformationPlugin = false;
                    for (var key in parameters) {
                        if (typeof userInformation[key] !== "string") {
                            userInformation[key] = Number(userInformation[key]);
                        }
                        $gameVariables.setValue(parameters[key], userInformation[key]);
                    }
                }).catch(function (error) {
                    switch (error.code) {
                    case "BAD_REQUEST":
                        SceneManager.catchException(error);
                        break;
                    case "FORBIDDEN":
                    case "INTERNAL_SERVER_ERROR":
                    case "API_CALL_LIMIT_EXCEEDED":
                    default:
                        that._waitForGetUserInformationPlugin = false;
                        var message = error.message;
                        if (message.length > 27) {
                            message = message.slice(0, 27) + "\n" + message.slice(27);
                        }
                        $gameVariables.setValue(parameters["errorMessage"], message);
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
        return result || Boolean(this._waitForGetUserInformationPlugin);
    };
})();
