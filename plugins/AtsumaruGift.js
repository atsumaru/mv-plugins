//=============================================================================
// AtsumaruGift.js
//
// Copyright (c) 2018-2020 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

(function () {
    'use strict';

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
    function hookStatic(baseClass, target, f) {
        baseClass[target] = f(baseClass[target]);
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
    function ensureValidVariableIds(parameters) {
        hookStatic(DataManager, "isDatabaseLoaded", function (origin) { return function () {
            if (!origin.apply(this, arguments)) {
                return false;
            }
            for (var key in parameters) {
                var variableId = parameters[key];
                if (variableId !== 0 && !isValidVariableId(variableId)) {
                    throw new Error("プラグインパラメータ「" + key + "」には、0～" + ($dataSystem.variables.length - 1) + "までの整数を指定してください。" + key + ": " + variableId);
                }
            }
            return true;
        }; });
    }

    /*:
     * @plugindesc RPGアツマールのギフトのためのプラグインです
     * @author RPGアツマール開発チーム
     *
     * @param totalPoint
     * @type variable
     * @text ギフト累計ポイント
     * @desc 「ギフト累計ポイント取得」コマンドで累計ポイントを代入する変数の番号を指定します。
     * @default 0
     *
     * @param myPoint
     * @type variable
     * @text ギフト自己ポイント
     * @desc 「ギフト自己ポイント取得」コマンドで自己ポイントを代入する変数の番号を指定します。
     * @default 0
     *
     * @param offsetHistories
     * @type variable
     * @text ギフト履歴(先頭)
     * @desc 「ギフト履歴取得」コマンドでギフト履歴の先頭を代入する変数の番号を指定します。
     * @default 1
     *
     * @param offsetRanking
     * @type variable
     * @text ギフトランキング(先頭)
     * @desc 「ギフトランキング取得」コマンドでギフトランキングの先頭を代入する変数の番号を指定します。
     * @default 1
     *
     * @param errorMessage
     * @type variable
     * @text エラーメッセージ
     * @desc エラーが発生した場合に、エラーメッセージを代入する変数の番号を指定します。
     * @default 0
     *
     * @help
     * このプラグインは、アツマールAPIの「ギフト」を利用するためのプラグインです。
     * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/gift)を参照してください。
     *
     * プラグインコマンド（英語版と日本語版のコマンドがありますが、どちらも同じ動作です）:
     *   DisplayGiftModal
     *   ギフト投稿画面表示
     *      # ギフトを一覧表示し、投稿を促す画面を表示します。
     *
     *   GetGiftTotalPoint
     *   ギフト累計ポイント取得
     *      # このゲームのギフトを何ポイントギフトしたかが「ギフト累計ポイント」で指定した変数に代入されます。
     *
     *   GetGiftMyPoint
     *   ギフト自己ポイント取得
     *      # このゲームのギフトを自分が何ポイントギフトしたかが「ギフト自己ポイント」で指定した変数に代入されます。
     *
     *   GetGiftHistories
     *   ギフト履歴取得
     *      # 履歴を取得すると、変数1番～30番に新しい順に名前が代入され、
     *        変数31番～60番に(変数1番～30番に対応する)ポイントが代入されます。
     *      # ギフトが匿名で投稿された場合、ポイントは取得できますが名前には0が代入されます。
     *      # 履歴が30件に満たなかった場合、残りの変数には0が代入されます。
     *      # プラグインパラメータ「ギフト履歴(先頭)」を変更することで、代入先をずらすこともできます。
     *        例:201を指定すると変数201番～230番に名前が、231番～260番にギフトポイントが代入されます。
     *
     *   GetGiftRanking
     *   ギフトランキング取得
     *      # ランキングを取得すると、変数1番～5番に1位から順に名前が代入され、
     *        変数6番～10番に(変数1番～5番に対応する)ポイントが代入されます。
     *      # ギフトが匿名で投稿された場合、ポイントは取得できますが名前には0が代入されます。
     *      # ランキングが5件に満たなかった場合、残りの変数には0が代入されます。
     *      # プラグインパラメータ「ギフトランキング(先頭)」を変更することで、代入先をずらすこともできます。
     *        例:201を指定すると変数201番～205番に名前が、206番～210番にギフトポイントが代入されます。
     *      # ランキング取得は最大5「件」までです。同着があれば5位まで取得できるとは限りません。
     *        例:上から順に1位,1位,3位,4位,4位などのケース
     *
     * アツマール外（テストプレイや他のサイト、ダウンロード版）での挙動:
     *      DisplayGiftModal（ギフト投稿画面表示）
     *          無視される
     *      GetGiftTotalPoint（ギフト累計ポイント取得）
     *          無視される（エラーメッセージにも何も代入されない）
     *      GetGiftMyPoint（ギフト自己ポイント取得）
     *          無視される（エラーメッセージにも何も代入されない）
     *      GetGiftHistories（ギフト履歴取得）
     *          無視される（エラーメッセージにも何も代入されない）
     *      GetGiftRanking（ギフトランキング取得）
     *          無視される（エラーメッセージにも何も代入されない）
     */
    var parameters = toTypedParameters(PluginManager.parameters("AtsumaruGift"));
    var getGiftDisplayCatalogModal = window.RPGAtsumaru && window.RPGAtsumaru.gift.displayCatalogModal;
    var getGiftTotalPoints = window.RPGAtsumaru && window.RPGAtsumaru.gift.getTotalPoints;
    var getGiftMyPoints = window.RPGAtsumaru && window.RPGAtsumaru.gift.getMyPoints;
    var getGiftHistories = window.RPGAtsumaru && window.RPGAtsumaru.gift.getHistories;
    var getGiftRanking = window.RPGAtsumaru && window.RPGAtsumaru.gift.getRanking;
    ensureValidVariableIds(parameters);
    prepareBindPromise();
    addPluginCommand({
        DisplayGiftModal: DisplayGiftModal,
        "ギフト投稿画面表示": DisplayGiftModal,
        GetGiftTotalPoint: GetGiftTotalPoint,
        "ギフト累計ポイント取得": GetGiftTotalPoint,
        GetGiftMyPoint: GetGiftMyPoint,
        "ギフト自己ポイント取得": GetGiftMyPoint,
        GetGiftHistories: GetGiftHistories,
        "ギフト履歴取得": GetGiftHistories,
        GetGiftRanking: GetGiftRanking,
        "ギフトランキング取得": GetGiftRanking,
    });
    function DisplayGiftModal() {
        if (getGiftDisplayCatalogModal) {
            getGiftDisplayCatalogModal();
        }
    }
    function GetGiftTotalPoint() {
        if (getGiftTotalPoints) {
            this.bindPromiseForRPGAtsumaruPlugin(getGiftTotalPoints(), function (result) {
                $gameVariables.setValue(parameters.totalPoint, result);
                $gameVariables.setValue(parameters.errorMessage, 0);
            }, function (error) { return $gameVariables.setValue(parameters.errorMessage, error.message); });
        }
    }
    function GetGiftMyPoint() {
        if (getGiftMyPoints) {
            this.bindPromiseForRPGAtsumaruPlugin(getGiftMyPoints(), function (items) {
                var myPoint = 0;
                for (var itemCode in items) {
                    myPoint += items[itemCode];
                }
                $gameVariables.setValue(parameters.myPoint, myPoint);
                $gameVariables.setValue(parameters.errorMessage, 0);
            }, function (error) { return $gameVariables.setValue(parameters.errorMessage, error.message); });
        }
    }
    function GetGiftHistories() {
        if (getGiftHistories) {
            this.bindPromiseForRPGAtsumaruPlugin(getGiftHistories(), function (result) {
                for (var i = 0; i < 30; i++) {
                    var user = result[i];
                    $gameVariables.setValue(parameters.offsetHistories + i, user ? user.userName : 0);
                    $gameVariables.setValue(parameters.offsetHistories + i + 30, user ? user.point : 0);
                }
                $gameVariables.setValue(parameters.errorMessage, 0);
            }, function (error) { return $gameVariables.setValue(parameters.errorMessage, error.message); });
        }
    }
    function GetGiftRanking() {
        if (getGiftRanking) {
            this.bindPromiseForRPGAtsumaruPlugin(getGiftRanking(), function (result) {
                for (var i = 0; i < 5; i++) {
                    var user = result[i];
                    $gameVariables.setValue(parameters.offsetRanking + i, user ? user.userName : 0);
                    $gameVariables.setValue(parameters.offsetRanking + i + 5, user ? user.point : 0);
                }
                $gameVariables.setValue(parameters.errorMessage, 0);
            }, function (error) { return $gameVariables.setValue(parameters.errorMessage, error.message); });
        }
    }

}());
