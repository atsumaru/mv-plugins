//=============================================================================
// AtsumaruCreatorInformationModalExperimental.js
//
// Copyright (c) 2018 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc RPGアツマールの作者情報ダイアログAPI操作のための(Experimental版)プラグインです
 * @author RPGアツマール開発チーム
 *
 * @help
 *
 * プラグインコマンド:
 *   DisplayCreatorInformationModal <niconicoUserId>        # 指定した<niconicoUserId>の作者情報ダイアログを表示します。省略した場合は現在のゲームの作者の作者情報ダイアログを表示します。
 *   作者情報ダイアログ表示 <niconicoUserId>        # コマンド名が日本語のバージョンです。動作は上記コマンドと同じ
 */
(function() {
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) { // eslint-disable-line no-unused-vars
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        if ((command === "DisplayCreatorInformationModal" || command === "作者情報ダイアログ表示") && window.RPGAtsumaru && window.RPGAtsumaru.experimental.popups && window.RPGAtsumaru.experimental.popups.displayCreatorInformationModal) {
            window.RPGAtsumaru.experimental.popups.displayCreatorInformationModal(args[0]);
        }
    };
})();
