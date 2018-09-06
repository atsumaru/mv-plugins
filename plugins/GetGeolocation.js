//=============================================================================
// GetGeolocation.js
//
// Copyright (c) 2018 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc Get player's geolocation
 * @author RPG Atsumaru development team
 *
 * @param latitude
 * @type number
 * @desc Specify the variable id to be assigned latitude
 * @default 1
 * 
 * @param longitude
 * @type number
 * @desc Specify the variable id to be assigned longitude
 * @default 2
 * 
 * @param altitude
 * @type number
 * @desc Specify the variable id to be assigned altitude
 * @default 3
 * 
 * @param accuracy
 * @type number
 * @desc Specify the variable id to be assigned accuracy of latitude and longitude
 * @default 4
 * 
 * @param altitudeAccuracy
 * @type number
 * @desc Specify the variable id to be assigned accuracy of altitude
 * @default 5
 * 
 * @param heading
 * @type number
 * @desc Specify the variable id to be assigned direction in which player moves
 * @default 6
 * 
 * @param speed
 * @type number
 * @desc Specify the variable id to be assigned speed of player moving
 * @default 7
 * 
 * @help
 *
 * Get player's geolocation by ◆Plugin Command：GetGeolocation
 * Geolocation is assigned to the variables you specified in "Parameters".
 * Zero is assigned to all of the variables you specified if failed to get geolocation.
 */

/*:ja
 * @plugindesc プレイヤーの位置情報を取得します。
 * @author RPGアツマール開発チーム
 *
 * @param latitude
 * @type number
 * @text 緯度
 * @desc 緯度を代入する変数の番号を指定します。
 * @default 1
 * 
 * @param longitude
 * @type number
 * @text 経度
 * @desc 経度を代入する変数の番号を指定します。
 * @default 2
 * 
 * @param altitude
 * @type number
 * @text 高度
 * @desc 高度を代入する変数の番号を指定します。
 * @default 3
 * 
 * @param accuracy
 * @type number
 * @text 精度
 * @desc 緯度・経度の精度を代入する変数の番号を指定します。
 * @default 4
 * 
 * @param altitudeAccuracy
 * @type number
 * @text 高度精度
 * @desc 高度の精度を代入する変数の番号を指定します。
 * @default 5
 * 
 * @param heading
 * @type number
 * @text 移動方向
 * @desc 移動方向（北：0、東：90、南：180、西：270）を代入する変数の番号を指定します。
 * @default 6
 * 
 * @param speed
 * @type number
 * @text 移動スピード
 * @desc 移動スピードを代入する変数の番号を指定します。
 * @default 7
 * 
 * @help
 *
 * ◆プラグインコマンド：GetGeolocation　で位置情報を取得します。
 * 取得した位置情報は「パラメータ」で指定した番号の変数に代入されます。
 * 位置情報の取得に失敗した場合は、指定したすべての変数に０が代入されます。
 */
(function() {
    'use strict';
    var pluginName = 'GetGeolocation';
    var parameters = PluginManager.parameters(pluginName);
    var wait = false;

    function setGeolocation(positionOrError) {
        for (var key in parameters) {
            $gameVariables.setValue(parameters[key], positionOrError.coords ? positionOrError.coords[key] : 0);
        }
        wait = false;
    }

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        if (command === pluginName) {
            wait = true;
            navigator.geolocation.getCurrentPosition(setGeolocation, setGeolocation);
        }
    };

    var _Game_Interpreter_updateWait = Game_Interpreter.prototype.updateWait;
    Game_Interpreter.prototype.updateWait = function() {
        return _Game_Interpreter_updateWait.apply(this, arguments) || !!wait;
    };
})();