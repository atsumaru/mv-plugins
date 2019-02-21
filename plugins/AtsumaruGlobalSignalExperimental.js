//=============================================================================
// AtsumaruGlobalSignalExperimental.js
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
        if (Game_Interpreter.prototype.bindPromiseForRPGAtsumaruPlugin) {
            return;
        }
        // ソフトリセットのタイミングでローディングカウンターを初期化
        hook(Game_Temp, "initialize", function (origin) { return function () {
            origin.apply(this, arguments);
            this._loadingCounterForRPGAtsumaruPlugin = 0;
        }; });
        // 通信中のセーブは許可しない。ハードリセットしてロードした後、
        // その通信がどんな結果だったのか、成功したか失敗したかなどを復元する方法はもはやないため
        hookStatic(DataManager, "saveGame", function (origin) { return function () {
            return $gameTemp._loadingCounterForRPGAtsumaruPlugin === 0 && origin.apply(this, arguments);
        }; });
        // Promiseを実行しつつ、それをツクールのインタプリタと結びつけて解決されるまで進行を止める
        Game_Interpreter.prototype.bindPromiseForRPGAtsumaruPlugin = function (promise, resolve, reject) {
            var _this = this;
            var $gameTempLocal = $gameTemp;
            $gameTempLocal._loadingCounterForRPGAtsumaruPlugin++;
            this._index--;
            this._promiseResolverForRPGAtsumaruPlugin = function () { return false; };
            promise.then(function (value) { return _this._promiseResolverForRPGAtsumaruPlugin = function () {
                $gameTempLocal._loadingCounterForRPGAtsumaruPlugin--;
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
                        $gameTempLocal._loadingCounterForRPGAtsumaruPlugin--;
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
                    throw new Error("プラグインパラメータ「" + key + "」には、0～" + ($dataSystem.variable.length - 1) + "までの整数を指定してください。" + key + ": " + variableId);
                }
            }
            return true;
        }; });
    }

    /*:
     * @plugindesc RPGアツマールのグローバルシグナルのための(Experimental版)プラグインです
     * @author RPGアツマール開発チーム
     *
     * @param signalData
     * @type variable
     * @text シグナルデータ
     * @desc グローバルシグナルの取得時に、シグナルデータを代入する変数の番号を指定します。
     * @default 0
     *
     * @param senderId
     * @type variable
     * @text 送信者のユーザーID
     * @desc グローバルシグナルの取得時に、送信者のユーザーIDを代入する変数の番号を指定します。
     * @default 0
     *
     * @param senderName
     * @type variable
     * @text 送信者のユーザー名
     * @desc グローバルシグナルの取得時に、送信者のユーザー名を代入する変数の番号を指定します。
     * @default 0
     *
     * @param restCount
     * @type variable
     * @text 残シグナル数
     * @desc グローバルシグナルの取得時に、今取得したものを含めた残りのシグナル数を代入する変数の番号を指定します。
     * @default 0
     *
     * @param errorMessage
     * @type variable
     * @text エラーメッセージ
     * @desc エラーが発生した場合に、エラーメッセージを代入する変数の番号を指定します。
     * @default 0
     *
     * @help
     * このプラグインは、アツマールAPIの「グローバルシグナル」を利用するためのプラグインです。
     * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/signal)を参照してください。
     *
     * プラグインコマンド（英語版と日本語版のコマンドがありますが、どちらも同じ動作です）:
     *   SendGlobalSignal <signalDataVariableId>
     *   グローバルシグナル送信 <signalDataVariableId>
     *     # 変数<signalDataVariableId>からシグナルデータを読み取り、
     *          それをグローバルシグナルとして送信します。
     *     # 例: SendGlobalSignal 1
     *     #   : グローバルシグナル送信 1
     *
     *   GetGlobalSignal
     *   グローバルシグナル取得
     *      # まだ取得したことがないグローバルシグナルの中で最も古い一件を読み込み、
     *          プラグインパラメータで指定した変数に値をセットします。
     *      # 残シグナル数が0だった時は、シグナルデータと送信者のユーザーID/名前には0がセットされます。
     *      # 残シグナル数が0か1だった時は、次の取得コマンドで新たなシグナルの受信を試みますので
     *          時間がかかることがあります。スムーズに実行したい場合は、
     *          次の取得コマンドの実行（受信）までに１０秒以上の時間を空けてください。
     *      # 例: GetGlobalSignal
     *      #   : グローバルシグナル取得
     *
     * アツマール外（テストプレイや他のサイト、ダウンロード版）での挙動:
     *      SendGlobalSignal（グローバルシグナル送信）
     *          無視される（エラーメッセージにも何も代入されない）
     *      GetGlobalSignal（グローバルシグナル取得）
     *          無視される（エラーメッセージにも何も代入されない）
     */
    var parameters = toTypedParameters(PluginManager.parameters("AtsumaruGlobalSignalExperimental"));
    var signal = window.RPGAtsumaru && window.RPGAtsumaru.experimental && window.RPGAtsumaru.experimental.signal;
    var sendGlobalSignal = signal && signal.sendSignalToGlobal;
    var getGlobalSignals = signal && signal.getGlobalSignals;
    ensureValidVariableIds(parameters);
    prepareBindPromise();
    addPluginCommand({
        SendGlobalSignal: SendGlobalSignal,
        "グローバルシグナル送信": SendGlobalSignal,
        GetGlobalSignal: GetGlobalSignal,
        "グローバルシグナル取得": GetGlobalSignal
    });
    hookStatic(DataManager, "createGameObjects", function (origin) { return function () {
        origin.apply(this, arguments);
        initialFetch();
    }; });
    hookStatic(DataManager, "extractSaveContents", function (origin) { return function () {
        origin.apply(this, arguments);
        initialFetch();
    }; });
    function initialFetch() {
        if (!$gameSystem._globalSignalStoreForRPGAtsumaruPlugin && getGlobalSignals) {
            $gameSystem._globalSignalStoreForRPGAtsumaruPlugin = { signals: [], lastPoppedSignals: [] };
            fetchGlobalSignal(getGlobalSignals, $gameSystem._globalSignalStoreForRPGAtsumaruPlugin);
        }
    }
    function fetchGlobalSignal(getGlobalSignals, store) {
        return getGlobalSignals().then(function (globalSignals) {
            globalSignals.sort(function (a, b) { return b.createdAt - a.createdAt; });
            if (store.lastPoppedSignals.length > 0) {
                var lastIndex = globalSignals.map(function (signal) { return signal.createdAt; })
                    .lastIndexOf(store.lastPoppedSignals[0].createdAt);
                if (lastIndex !== -1) {
                    globalSignals = globalSignals.slice(0, lastIndex + 1);
                    difference(globalSignals, store.lastPoppedSignals);
                }
            }
            store.signals = globalSignals;
        });
    }
    function difference(signals, excludes) {
        var excludeIds = excludes.map(function (signal) { return signal.id; });
        var excludeCreatedAt = excludes[0].createdAt;
        for (var index = signals.length - 1; index >= 0 && signals[index].createdAt === excludeCreatedAt; index--) {
            if (excludeIds.indexOf(signals[index].id) !== -1) {
                signals.splice(index, 1);
            }
        }
    }
    function SendGlobalSignal(command, signalDataVariableIdStr) {
        var signalDataVariableId = toValidVariableId(signalDataVariableIdStr, command, "signalDataVariableId");
        var signalData = String($gameVariables.value(signalDataVariableId));
        if (sendGlobalSignal) {
            this.bindPromiseForRPGAtsumaruPlugin(sendGlobalSignal(signalData), function () { return $gameVariables.setValue(parameters.errorMessage, 0); }, function (error) { return $gameVariables.setValue(parameters.errorMessage, error.message); });
        }
    }
    function GetGlobalSignal() {
        if (getGlobalSignals) {
            var store_1 = $gameSystem._globalSignalStoreForRPGAtsumaruPlugin;
            if (store_1.signals.length === 0) {
                this.bindPromiseForRPGAtsumaruPlugin(throttlePromise(function () { return fetchGlobalSignal(getGlobalSignals, store_1); }), function () { return setGlobalSignal(store_1); }, function (error) { return $gameVariables.setValue(parameters.errorMessage, error.message); });
            }
            else {
                setGlobalSignal(store_1);
            }
        }
    }
    var lastApiCallTime = 0;
    var apiCallInterval = 10000;
    // Promiseの間隔が１０秒に１回を切るようなら間隔が開くようにPromiseの開始を遅延する
    function throttlePromise(promise) {
        return new Promise(function (resolve) {
            var delta = lastApiCallTime + apiCallInterval - Date.now();
            if (delta > 0) {
                setTimeout(function () { return resolve(throttlePromise(promise)); }, delta);
            }
            else {
                lastApiCallTime = Date.now();
                resolve(promise());
            }
        });
    }
    function setGlobalSignal(store) {
        $gameVariables.setValue(parameters.signalData, 0);
        $gameVariables.setValue(parameters.senderId, 0);
        $gameVariables.setValue(parameters.senderName, 0);
        $gameVariables.setValue(parameters.restCount, store.signals.length);
        $gameVariables.setValue(parameters.errorMessage, 0);
        var signal = store.signals.pop();
        if (signal) {
            $gameVariables.setValue(parameters.signalData, isNumber(signal.data) ? +signal.data : signal.data);
            $gameVariables.setValue(parameters.senderId, signal.senderId);
            $gameVariables.setValue(parameters.senderName, signal.senderName);
            if (store.lastPoppedSignals.length > 0 && store.lastPoppedSignals[0].createdAt !== signal.createdAt) {
                store.lastPoppedSignals = [];
            }
            store.lastPoppedSignals.push(signal);
        }
    }

}());
