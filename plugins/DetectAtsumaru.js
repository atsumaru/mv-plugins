//=============================================================================
// DetectAtsumaru.js
//
// Copyright (c) 2018 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc RPGアツマール環境かどうかを判定し、指定した変数に代入するプラグインです
 * @author RPGアツマール開発チーム
 *
 * @help
 *
 * プラグインコマンド:
 *   DetectAtsumaru <id>         # アツマール環境であれば1を、そうでなければ0を変数id1に代入
 *   アツマール判定 <id>          # 上記コマンドの日本語バージョン
 */
(function() {
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        if (command === "DetectAtsumaru" || command === "アツマール判定") {
            var isAtsumaru = 0;
            if (window.RPGAtsumaru) { // windowにRPGAtsumaruオブジェクトが生えていることで確認する
                isAtsumaru = 1;
            }
            $gameVariables.setValue(args[0], isAtsumaru);
        }
    };
})();
