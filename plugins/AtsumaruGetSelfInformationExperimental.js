//=============================================================================
// AtsumaruGetSelfInformationExperimental.js
//
// Copyright (c) 2018 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc RPGアツマールのプレイヤー本人の情報を取得するAPIのための(Experimental版)プラグインです
 * @author RPGアツマール開発チーム
 *
 * @param id
 * @type variable
 * @text ユーザーID
 * @desc 自己情報取得時に、ユーザーIDを代入する変数の番号を指定します。
 * @default 0
 *
 * @param name
 * @type variable
 * @text ユーザー名
 * @desc 自己情報取得時に、ユーザー名を代入する変数の番号を指定します。
 * @default 0
 *
 * @param profile
 * @type variable
 * @text 自己紹介
 * @desc 自己情報取得時に、自己紹介を代入する変数の番号を指定します。
 * @default 0
 *
 * @param twitterId
 * @type variable
 * @text TwitterID
 * @desc 自己情報取得時に、TwitterIDを代入する変数の番号を指定します。
 * @default 0
 *
 * @param url
 * @type variable
 * @text ウェブサイト
 * @desc 自己情報取得時に、ウェブサイトを代入する変数の番号を指定します。
 * @default 0
 *
 * @param isPremium
 * @type variable
 * @text プレミアム会員か
 * @desc 自己情報取得時に、プレミアム会員かどうかを代入する変数の番号を指定します。(1 = プレミアム会員, 0 = 一般会員)
 * @default 0
 *
 * @param errorMessage
 * @type variable
 * @text エラーメッセージ
 * @desc エラーが発生した場合に、エラーメッセージを代入する変数の番号を指定します。
 * @default 0
 *
 * @help
 * RPGアツマールで、プレイヤー本人のプロフィールなどの情報を取得します。
 *
 * プラグインコマンド（英語版と日本語版のコマンドがありますが、どちらも同じ動作です）:
 *   GetSelfInformation
 *   プレイヤー取得
 *      # プレイヤー本人の情報を取得します。
 *      # 取得した情報は、プラグインパラメータで指定した変数IDに代入されます。
 *      # もしも情報が取得できなかった場合は、エラーメッセージが代入されます。
 *
 * アツマール外（テストプレイや他のサイト、ダウンロード版）での挙動:
 *      GetSelfInformation（プレイヤー取得）
 *          無視される（エラーメッセージにも何も代入されない）
 */
(function() {
    "use strict";
    var pluginName = "AtsumaruGetSelfInformationExperimental";
    var parameters = PluginManager.parameters(pluginName);
    var userDefined = window.RPGAtsumaru && window.RPGAtsumaru.experimental.user;
    var getSelfInformationDefined = userDefined && window.RPGAtsumaru.experimental.user.getSelfInformation;

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        var that = this;
        if (command === "GetSelfInformation" || command === "プレイヤー取得") {
            if (getSelfInformationDefined) {
                this._waitForGetSelfInformationPlugin = true;
                window.RPGAtsumaru.experimental.user.getSelfInformation().then(function(selfInformation) {
                    that._waitForGetSelfInformationPlugin = false;
                    for (var key in parameters) {
                        if (typeof selfInformation[key] !== "string") {
                            selfInformation[key] = Number(selfInformation[key]);
                        }
                        $gameVariables.setValue(parameters[key], selfInformation[key]);
                    }
                }).catch(function (error) {
                    switch (error.code) {
                    case "UNAUTHORIZED":
                    case "INTERNAL_SERVER_ERROR":
                    case "API_CALL_LIMIT_EXCEEDED":
                    default:
                        that._waitForGetSelfInformationPlugin = false;
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
        return result || Boolean(this._waitForGetSelfInformationPlugin);
    };
})();
