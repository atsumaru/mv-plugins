//=============================================================================
// AtsumaruEnableInterplayerExperimental.js
//
// Copyright (c) 2018 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

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
(function() {
    "use strict";
    var pluginName = "AtsumaruEnableInterplayerExperimental";
    var parameters = PluginManager.parameters(pluginName);
    var errorMessage = Number(parameters["errorMessage"]);
    var interplayerDefined = window.RPGAtsumaru && window.RPGAtsumaru.experimental.interplayer;
    var enableInterplayerDefined = interplayerDefined && window.RPGAtsumaru.experimental.interplayer.enable;

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        var that = this;
        if (command === "EnableInterplayer" || command === "プレイヤー間通信有効化") {
            if (enableInterplayerDefined) {
                this._waitForEnableInterplayerPlugin = true;
                window.RPGAtsumaru.experimental.interplayer.enable()
                    .then(function() {
                        that._waitForEnableInterplayerPlugin = false;
                        $gameVariables.setValue(errorMessage, 0);
                    }, function(error) {
                        switch (error.code) {
                        case "UNAUTHORIZED":
                        case "INTERNAL_SERVER_ERROR":
                        case "API_CALL_LIMIT_EXCEEDED":
                        default:
                            that._waitForEnableInterplayerPlugin = false;
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
        return result || Boolean(this._waitForEnableInterplayerPlugin);
    };
})();
