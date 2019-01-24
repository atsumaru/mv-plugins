//=============================================================================
// DetectAtsumaru.js
//
// Copyright (c) 2018 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

(function () {
    'use strict';

    function isNumber(value) {
        return value !== "" && !isNaN(value);
    }
    function isInteger(value) {
        return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
    }
    function isNatural(value) {
        return isInteger(value) && value > 0;
    }
    function isValidVariableId(variableId) {
        return isNatural(variableId) && variableId < $dataSystem.variables.length;
    }

    // 既存のクラスとメソッド名を取り、そのメソッドに処理を追加する
    function hook(baseClass, target, f) {
        baseClass.prototype[target] = f(baseClass.prototype[target]);
    }
    // プラグインコマンドを追加する
    function addPluginCommand(commands) {
        hook(Game_Interpreter, "pluginCommand", function (origin) { return function (command, args) {
            origin.apply(this, arguments);
            if (commands[command]) {
                commands[command].apply(this, [command].concat(args));
            }
        }; });
    }

    function toDefined(value, command, name) {
        if (value === undefined) {
            throw new Error("「" + command + "」コマンドでは、" + name + "を指定してください。");
        }
        else {
            return value;
        }
    }
    function toValidVariableId(value, command, name) {
        value = toDefined(value, command, name);
        var number = +value;
        if (isNumber(value) && isValidVariableId(number)) {
            return number;
        }
        else {
            throw new Error("「" + command + "」コマンドでは、" + name + "には1～" + ($dataSystem.variables.length - 1) + "までの整数を指定してください。" + name + ": " + value);
        }
    }

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
    var isRPGAtsumaru = window.RPGAtsumaru ? 1 : 0;
    addPluginCommand({
        DetectAtsumaru: DetectAtsumaru,
        "アツマール判定": DetectAtsumaru
    });
    function DetectAtsumaru(command, idStr) {
        $gameVariables.setValue(toValidVariableId(idStr, command, "id"), isRPGAtsumaru);
    }

}());
