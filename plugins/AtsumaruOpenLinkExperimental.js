//=============================================================================
// AtsumaruOpenLinkExperimental.js
//
// Copyright (c) 2018 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc RPGアツマールで外部リンクを開く(Experimental版)プラグインです
 * @author RPGアツマール開発チーム
 *
 * @help
 *
 * プラグインコマンド:
 *   OpenLink <url>         # <url>を開く
 */
(function() {
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        if (command === "OpenLink" && window.RPGAtsumaru && window.RPGAtsumaru.experimental.popups && window.RPGAtsumaru.experimental.popups.openLink) {
            window.RPGAtsumaru.experimental.popups.openLink(args[0]);
        }
    };
})();
