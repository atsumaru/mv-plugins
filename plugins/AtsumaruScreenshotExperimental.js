//=============================================================================
// AtsumaruScreenshotExperimental.js
//
// Copyright (c) 2018 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc RPGアツマールのスクリーンショットAPI操作のための(Experimental版)プラグインです
 * @author RPGアツマール開発チーム
 *
 * @help
 *
 * プラグインコマンド:
 *   DisplayScreenshotModal         # スクリーンショットモーダルを表示
 */
(function() {
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) { // eslint-disable-line no-unused-vars
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        if (command === "DisplayScreenshotModal" && window.RPGAtsumaru && window.RPGAtsumaru.experimental.screenshot && window.RPGAtsumaru.experimental.screenshot.displayModal) {
            window.RPGAtsumaru.experimental.screenshot.displayModal();
        }
    };
})();
