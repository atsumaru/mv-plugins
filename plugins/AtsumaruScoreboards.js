//=============================================================================
// AtsumaruScoreboards.js
//
// Copyright (c) 2018-2021 ゲームアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
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

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __spreadArray(to, from) {
        for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
            to[j] = from[i];
        return to;
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
                commands[command].apply(this, __spreadArray([command], args));
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

    function toDefined(value, command, name) {
        if (value === undefined) {
            throw new Error("「" + command + "」コマンドでは、" + name + "を指定してください。");
        }
        else {
            return value;
        }
    }
    function toInteger(value, command, name) {
        value = toDefined(value, command, name);
        var number = +value;
        if (isNumber(value) && isInteger(number)) {
            return number;
        }
        else {
            throw new Error("「" + command + "」コマンドでは、" + name + "には整数を指定してください。" + name + ": " + value);
        }
    }
    function toNatural(value, command, name) {
        value = toDefined(value, command, name);
        var number = +value;
        if (isNumber(value) && isNatural(number)) {
            return number;
        }
        else {
            throw new Error("「" + command + "」コマンドでは、" + name + "には自然数を指定してください。" + name + ": " + value);
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
    function toValidVariableIdOrUndefined(value, command, name) {
        if (value === undefined) {
            return value;
        }
        var number = +value;
        if (isNumber(value) && isValidVariableId(number)) {
            return number;
        }
        else {
            throw new Error("「" + command + "」コマンドでは、" + name + "を指定する場合は1～" + ($dataSystem.variables.length - 1) + "までの整数を指定してください。" + name + ": " + value);
        }
    }

    /*:
     * @plugindesc RPGアツマールのスコアボードのプラグインです
     * @author RPGアツマール開発チーム
     *
     * @help
     * このプラグインは、アツマールAPIの「スコアボード」を利用するためのプラグインです。
     * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/scoreboard)を参照してください。
     *
     * プラグインコマンド（英語版と日本語版のコマンドがありますが、どちらも同じ動作です）:
     *   SetRecordToScoreboard <boardId> <variableId>
     *   スコア送信 <boardId> <variableId>
     *      # 変数<variableId>からスコアを読み取り、スコアボード<boardId>にセットする。
     *      # 送信できるスコアの値は整数のみ。（負の整数可）
     *      # 例: SetRecordToScoreboard 1 6
     *      #   : スコア送信 1 6
     *
     *   SetRecordToScoreboard <boardId> <variableId> <errorVariableId>
     *   スコア送信 <boardId> <variableId> <errorVariableId>
     *      # 変数<variableId>からスコアを読み取り、スコアボード<boardId>にセットする。
     *      # 送信できるスコアの値は整数のみ。（負の整数可）
     *      # また、変数<errorVariableId>に
     *          スコアの送信に失敗した場合はエラーメッセージ、成功した場合は0がセットされる
     *      # 例: SetRecordToScoreboard 1 6 7
     *      #   : スコア送信 1 6 7
     *
     *   DisplayScoreboard <boardId>
     *   スコア表示 <boardId>
     *      # スコアボード<boardId>を開く
     *      # 例: DisplayScoreboard 1
     *      #   : スコア表示 1
     *
     *   FetchRecordsFromScoreboard <boardId>
     *   スコア受信 <boardId>
     *      # スコアボード<boardId>をサーバから読み込んで準備する
     *      # 例: FetchRecordsFromScoreboard 1
     *      #   : スコア受信 1
     *
     *   GetDataFromScoreboardRecords <target> <variableId>
     *   スコア取得 <target> <variableId>
     *      # 準備したスコアボードから<target>情報を読み込んで変数<variableId>にセットする。
     *      # 準備ができてない場合は0がセットされる。
     *      # 例: GetDataFromScoreboardRecords ranking[0].score 7
     *      #   : スコア取得 ranking[0].score 7
     *
     *      target一覧
     *          myRecord # 今回の自己レコードがある場合は1、ない場合は0がセットされる
     *          myRecord.rank # 今回の自己レコードの順位、ない場合は0がセットされる
     *          myRecord.score # 今回の自己レコードのスコア、ない場合は0がセットされる
     *          myRecord.isNewRecord # 今回の自己レコードが自己新記録なら1、そうでない場合は0がセットされる
     *          ranking.length # ランキングデータの長さ
     *          ranking[n].rank # n+1番目の人の順位がセットされる
     *          ranking[n].userName # n+1番目の人のユーザ名がセットされる
     *          ranking[n].score # n+1番目の人のスコアがセットされる
     *          myBestRecord # 自己最高記録がある場合は1、ない場合（または非ログイン）は0がセットされる
     *          myBestRecord.rank # 自己最高記録の順位、ない場合（または非ログイン）は0がセットされる
     *          myBestRecord.score # 自己最高記録のスコア、ない場合（または非ログイン）は0がセットされる
     *          errorMessage # スコアの読み込みに失敗した場合はエラーメッセージ、成功した場合は0がセットされる
     *
     * スコアボードの仕様:
     *      <boardId>は、1〜（ボードの数）までの整数 ボードの数の初期値は10
     *      登録したスコアは、そのプレイヤーがプレミアム会員の場合は永続保存される
     *      プレイヤーが一般会員だとボードごとに最新100ユーザしか保存されない
     *
     * アツマール外（テストプレイや他のサイト、ダウンロード版）での挙動:
     *      SetRecordToScoreboard（スコア送信）
     *          無視される（変数<errorVariableId>には何もセットされない）
     *      DisplayScoreboard（スコア表示）
     *          無視される
     *      FetchRecordsFromScoreboard（スコア受信）
     *          無視される
     *      GetDataFromScoreboardRecords（スコア取得）
     *          どの<target>を指定しても、結果はすべて0がセットされる
     *
     * ※「並列処理」の中でプラグインコマンドを利用しますと
     *   その時セーブしたセーブデータの状態が不確定になりますので、
     *   可能な限り「並列処理」以外のトリガーでご利用ください。
     */
    var scoreboards = window.RPGAtsumaru && window.RPGAtsumaru.scoreboards;
    var setRecord = scoreboards && scoreboards.setRecord;
    var display = scoreboards && scoreboards.display;
    var getRecords = scoreboards && scoreboards.getRecords;
    var recordsFromScoreboard = null;
    prepareBindPromise();
    addPluginCommand({
        SetRecordToScoreboard: SetRecordToScoreboard,
        "スコア送信": SetRecordToScoreboard,
        DisplayScoreboard: DisplayScoreboard,
        "スコア表示": DisplayScoreboard,
        FetchRecordsFromScoreboard: FetchRecordsFromScoreboard,
        "スコア受信": FetchRecordsFromScoreboard,
        GetDataFromScoreboardRecords: GetDataFromScoreboardRecords,
        "スコア取得": GetDataFromScoreboardRecords
    });
    function SetRecordToScoreboard(command, boardIdStr, variableIdStr, errorVariableIdStr) {
        var boardId = toNatural(boardIdStr, command, "boardId");
        var variableId = toValidVariableId(variableIdStr, command, "variableId");
        var errorVariableId = toValidVariableIdOrUndefined(errorVariableIdStr, command, "errorVariableId");
        var score = toInteger($gameVariables.value(variableId), command, "score");
        if (setRecord) {
            if (errorVariableId === undefined) {
                this.bindPromiseForRPGAtsumaruPlugin(setRecord(boardId, score));
            }
            else {
                this.bindPromiseForRPGAtsumaruPlugin(setRecord(boardId, score), function () { return $gameVariables.setValue(errorVariableId, 0); }, function (error) { return $gameVariables.setValue(errorVariableId, error.message); });
            }
        }
    }
    function DisplayScoreboard(command, boardIdStr) {
        var boardId = toNatural(boardIdStr, command, "boardId");
        if (display) {
            this.bindPromiseForRPGAtsumaruPlugin(display(boardId));
        }
    }
    function FetchRecordsFromScoreboard(command, boardIdStr) {
        var boardId = toNatural(boardIdStr, command, "boardId");
        if (getRecords) {
            this.bindPromiseForRPGAtsumaruPlugin(getRecords(boardId), function (value) { return recordsFromScoreboard = value; }, function (error) { return recordsFromScoreboard = { errorMessage: error.message }; });
        }
    }
    function GetDataFromScoreboardRecords(command, target, variableIdStr) {
        target = toDefined(target, command, "target");
        var variableId = toValidVariableId(variableIdStr, command, "variableId");
        if (!recordsFromScoreboard) {
            $gameVariables.setValue(variableId, 0);
            return;
        }
        var result;
        try {
            result = (new Function("return this." + target)).call(recordsFromScoreboard);
        }
        catch (e) {
            //エラーは握りつぶしてuserNameだけ空データを入れる
            if (/\.userName$/.test(target)) {
                result = "";
            }
        }
        switch (typeof result) {
            case "undefined":
            case "object": // nullもここ
            case "symbol":
            case "function":
            case "boolean":
                $gameVariables.setValue(variableId, result ? 1 : 0);
                break;
            default:
                $gameVariables.setValue(variableId, result);
                break;
        }
    }

}());
