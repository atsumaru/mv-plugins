//=============================================================================
// AtsumaruGetRecentUsersExperimental.js
//
// Copyright (c) 2018 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

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
 */
(function() {
    "use strict";
    var pluginName = "AtsumaruGetRecentUsersExperimental";
    var parameters = PluginManager.parameters(pluginName);
    var offset = Number(parameters["offset"]);
    var errorMessage = Number(parameters["errorMessage"]);
    var userDefined = window.RPGAtsumaru && window.RPGAtsumaru.experimental.user;
    var getRecentUsersDefined = userDefined && window.RPGAtsumaru.experimental.user.getRecentUsers;

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        var that = this;
        if (command === "GetRecentUsers" || command === "最新ユーザー取得") {
            if (getRecentUsersDefined) {
                this._waitForGetRecentUsersPlugin = true;
                window.RPGAtsumaru.experimental.user.getRecentUsers()
                    .then(function(recentUsers) {
                        that._waitForGetRecentUsersPlugin = false;
                        $gameVariables.setValue(errorMessage, 0);
                        for (var i = 0; i < 100; i++) {
                            var user = recentUsers[i];
                            $gameVariables.setValue(offset + i, user ? user.id : 0);
                            $gameVariables.setValue(offset + i + 100, user ? user.name : 0);
                        }
                    }, function(error) {
                        switch (error.code) {
                        case "INTERNAL_SERVER_ERROR":
                        case "API_CALL_LIMIT_EXCEEDED":
                        default:
                            that._waitForGetRecentUsersPlugin = false;
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
        return result || Boolean(this._waitForGetRecentUsersPlugin);
    };
})();
