//=============================================================================
// AtsumaruOpenLink.js
//
// Copyright (c) 2018 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc RPGアツマールで外部リンクを開くプラグインです
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
        if (command === "OpenLink" && window.RPGAtsumaru && window.RPGAtsumaru.popups && window.RPGAtsumaru.popups.openLink) {
            window.RPGAtsumaru.popups.openLink(args[0]);
        }
    };
})();
