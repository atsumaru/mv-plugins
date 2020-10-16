//=============================================================================
// GetGeolocation.js
//
// Copyright (c) 2018-2020 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

(function () {
    'use strict';

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
    // Promiseが終了するまでイベントコマンドをウェイトするための処理を追加する
    function prepareBindPromise() {
        if (!!Game_Interpreter.prototype.bindPromiseForRPGAtsumaruPlugin) {
            return;
        }
        // Promiseを実行しつつ、それをツクールのインタプリタと結びつけて解決されるまで進行を止める
        Game_Interpreter.prototype.bindPromiseForRPGAtsumaruPlugin = function (promise, resolve, reject) {
            var _this = this;
            this._index--;
            this._promiseResolverForRPGAtsumaruPlugin = function () { return false; };
            promise.then(function (value) { return _this._promiseResolverForRPGAtsumaruPlugin = function () {
                _this._index++;
                delete _this._promiseResolverForRPGAtsumaruPlugin;
                if (resolve) {
                    resolve(value);
                }
                return true;
            }; }, function (error) { return _this._promiseResolverForRPGAtsumaruPlugin = function () {
                for (var key in _this._eventInfo) {
                    error[key] = _this._eventInfo[key];
                }
                error.line = _this._index + 1;
                error.eventCommand = "plugin_command";
                error.content = _this._params[0];
                switch (error.code) {
                    case "BAD_REQUEST":
                        throw error;
                    case "UNAUTHORIZED":
                    case "FORBIDDEN":
                    case "INTERNAL_SERVER_ERROR":
                    case "API_CALL_LIMIT_EXCEEDED":
                    default:
                        console.error(error.code + ": " + error.message);
                        console.error(error.stack);
                        if (Graphics._showErrorDetail && Graphics._formatEventInfo && Graphics._formatEventCommandInfo) {
                            var eventInfo = Graphics._formatEventInfo(error);
                            var eventCommandInfo = Graphics._formatEventCommandInfo(error);
                            console.error(eventCommandInfo ? eventInfo + ", " + eventCommandInfo : eventInfo);
                        }
                        _this._index++;
                        delete _this._promiseResolverForRPGAtsumaruPlugin;
                        if (reject) {
                            reject(error);
                        }
                        return true;
                }
            }; });
        };
        // 通信待機中はこのコマンドで足踏みし、通信に成功または失敗した時にPromiseの続きを解決する
        // このタイミングまで遅延することで、以下のようなメリットが生まれる
        // １．解決が次のコマンドの直前なので、他の並列処理に結果を上書きされない
        // ２．ゲームループ内でエラーが発生するので、エラー発生箇所とスタックトレースが自然に詳細化される
        // ３．ソフトリセット後、リセット前のexecuteCommandは叩かれなくなるので、
        //     リセット前のPromiseのresolverがリセット後のグローバルオブジェクトを荒らす事故がなくなる
        hook(Game_Interpreter, "executeCommand", function (origin) { return function () {
            if (this._promiseResolverForRPGAtsumaruPlugin) {
                var resolved = this._promiseResolverForRPGAtsumaruPlugin();
                if (!resolved) {
                    return false;
                }
            }
            return origin.apply(this, arguments);
        }; });
    }

    function toTypedParameters(parameters, isArray) {
        if (isArray === void 0) { isArray = false; }
        var result = isArray ? [] : {};
        for (var key in parameters) {
            try {
                var value = JSON.parse(parameters[key]);
                result[key] = value instanceof Array ? toTypedParameters(value, true)
                    : value instanceof Object ? toTypedParameters(value)
                        : value;
            }
            catch (error) {
                result[key] = parameters[key];
            }
        }
        return result;
    }

    /*:
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
     * ◆プラグインコマンド：GetGeolocation で位置情報を取得します。
     * 取得した位置情報は「パラメータ」で指定した番号の変数に代入されます。
     * 位置情報の取得に失敗した場合は、指定したすべての変数に０が代入されます。
     *
     * ※「並列処理」の中でプラグインコマンドを利用しますと
     *   その時セーブしたセーブデータの状態が不確定になりますので、
     *   可能な限り「並列処理」以外のトリガーでご利用ください。
     */
    var parameters = toTypedParameters(PluginManager.parameters("GetGeolocation"));
    var getGeolocation = function () { return new Promise(function (resolve, reject) { return navigator.geolocation.getCurrentPosition(resolve, reject); }); };
    var setGeolocation = function (positionOrError) {
        for (var key in parameters) {
            $gameVariables.setValue(parameters[key], positionOrError.coords ? positionOrError.coords[key] : 0);
        }
    };
    prepareBindPromise();
    addPluginCommand({
        GetGeolocation: GetGeolocation,
        "位置情報取得": GetGeolocation
    });
    function GetGeolocation() {
        this.bindPromiseForRPGAtsumaruPlugin(getGeolocation(), setGeolocation, setGeolocation);
    }

}());
