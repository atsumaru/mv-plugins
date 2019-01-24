//=============================================================================
// AtsumaruQueryExperimental.js
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
     * @plugindesc RPGアツマールのquery情報を変数にコピーする(Experimental版)プラグインです
     * @author RPGアツマール開発チーム
     *
     * @help
     *
     * プラグインコマンド:
     *   CopyQuery <id1> <id2>...         # param1をid1にコピー、param2をid2にコピー
     *   クエリ取得 <id1> <id2>...         # コマンド名が日本語のバージョンです。動作は上記コマンドと同じ
     */
    var query = window.RPGAtsumaru && window.RPGAtsumaru.experimental && window.RPGAtsumaru.experimental.query;
    addPluginCommand({
        CopyQuery: CopyQuery,
        "クエリ取得": CopyQuery
    });
    function CopyQuery(command) {
        var idStrList = Array.prototype.slice.call(arguments, 1);
        for (var i = 0; i < idStrList.length; ++i) {
            var key = "param" + String(i + 1);
            $gameVariables.setValue(toValidVariableId(idStrList[i], command, "id" + (i + 1)), query ? query[key] : "");
        }
    }

}());
