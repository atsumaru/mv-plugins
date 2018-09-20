//=============================================================================
// AtsumaruQueryExperimental.js
//
// Copyright (c) 2018 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc RPGアツマールのquery情報を変数にコピーする(Experimental版)プラグインです
 * @author RPGアツマール開発チーム
 *
 * @help
 *
 * プラグインコマンド:
 *   CopyQuery <id1> <id2>...         # param1をid1にコピー、param2をid2にコピー
 *   クエリ取得 <id1> <id2>...         # コマンド名が日本語のバージョンです。動作は上記コマンドと同じ
 */
(function() {
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        if (command === "CopyQuery" || command === "クエリ取得") {
            for (var i = 0; i < args.length; ++i) {
                var key = "param" + String(i + 1);
                var value = "";
                if (window.RPGAtsumaru && window.RPGAtsumaru.experimental.query && window.RPGAtsumaru.experimental.query[key]) {
                    value = window.RPGAtsumaru.experimental.query[key];
                }
                $gameVariables.setValue(args[i], value);
            }
        }
    };
})();
