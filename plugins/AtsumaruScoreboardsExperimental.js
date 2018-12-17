//=============================================================================
// AtsumaruScoreboardsExperimental.js
//
// Copyright (c) 2018 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc RPGアツマールのスコアボードのプラグインです
 * @author RPGアツマール開発チーム
 *
 * @help
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
 */
(function() {
    "use strict";
    function isInteger(value) {
        return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
    }

    function isNatural(value) {
        return isInteger(value) && value > 0;
    }

    function isValidVariableId(variableId) {
        return isNatural(variableId) && variableId < $dataSystem.variables.length;
    }

    var scoreboardsDefined = window.RPGAtsumaru && window.RPGAtsumaru.experimental.scoreboards;
    var setRecordDefined = scoreboardsDefined && window.RPGAtsumaru.experimental.scoreboards.setRecord;
    var displayDefined = scoreboardsDefined && window.RPGAtsumaru.experimental.scoreboards.display;
    var getRecordsDefined = scoreboardsDefined && window.RPGAtsumaru.experimental.scoreboards.getRecords;
    var recordsFromScoreboard = null;
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        var boardId;
        var variableId;
        var variableMax = $dataSystem.variables.length - 1;
        var that = this;
        if (command === "SetRecordToScoreboard" || command === "スコア送信") {
            if (args.length < 2) {
                throw new Error("「" + command + "」コマンドでは、boardIdとvariableIdを両方指定してください");
            }
            boardId = Number(args[0]);
            variableId = Number(args[1]);
            var errorVariableId = Number(args[2]);
            if (!isNatural(boardId)) {
                throw new Error("「" + command + "」コマンドでは、boardIdには自然数を指定してください。boardId: " + args[0]);
            }
            if (!isValidVariableId(variableId)) {
                throw new Error("「" + command + "」コマンドでは、variableIdには1～" + variableMax + "までの整数を指定してください。variableId: " + args[1]);
            }
            if (args.length > 2 && !isValidVariableId(errorVariableId)) {
                throw new Error("「" + command + "」コマンドでは、errorVariableIdには1～" + variableMax + "までの整数を指定してください。errorVariableId: " + args[2]);
            }
            var score = $gameVariables.value(variableId);
            if (typeof score !== "number") {
                score = Number(score);
            }
            if (!isInteger(score)) {
                throw new Error("「" + command + "」コマンドでは、scoreには整数を指定してください。score: " + $gameVariables.value(variableId));
            }
            if (setRecordDefined) {
                this._waitForScoreboardPlugin = true;
                window.RPGAtsumaru.experimental.scoreboards.setRecord(boardId, score)
                    .then(function() {
                        that._waitForScoreboardPlugin = false;
                        if (args.length > 2) {
                            $gameVariables.setValue(errorVariableId, 0);
                        }
                    }, function(error) {
                        switch (error.code) {
                        case "BAD_REQUEST":
                            SceneManager.catchException(error);
                            break;
                        case "INTERNAL_SERVER_ERROR":
                        case "API_CALL_LIMIT_EXCEEDED":
                        default:
                            that._waitForScoreboardPlugin = false;
                            var message = error.message;
                            if (message.length > 27) {
                                message = message.slice(0, 27) + "\n" + message.slice(27);
                            }
                            if (args.length > 2) {
                                $gameVariables.setValue(errorVariableId, message);
                            }
                            console.error(error);
                            break;
                        }
                    });
            }
        } else if (command === "DisplayScoreboard" || command === "スコア表示") {
            if (args.length < 1) {
                throw new Error("「" + command + "」コマンドでは、boardIdを指定してください");
            }
            boardId = Number(args[0]);
            if (!isNatural(boardId)) {
                throw new Error("「" + command + "」コマンドでは、boardIdには自然数を指定してください。boardId: " + args[0]);
            }
            if (displayDefined) {
                window.RPGAtsumaru.experimental.scoreboards.display(boardId);
            }
        } else if (command === "FetchRecordsFromScoreboard" || command === "スコア受信") {
            if (args.length < 1) {
                throw new Error("「" + command + "」コマンドでは、boardIdを指定してください");
            }
            boardId = Number(args[0]);
            if (!isNatural(boardId)) {
                throw new Error("「" + command + "」コマンドでは、boardIdには自然数を指定してください。boardId: " + args[0]);
            }
            if (getRecordsDefined) {
                this._waitForScoreboardPlugin = true;
                window.RPGAtsumaru.experimental.scoreboards.getRecords(boardId).then(function(result) {
                    recordsFromScoreboard = result;
                    that._waitForScoreboardPlugin = false;
                }, function(error) {
                    switch (error.code) {
                    case "BAD_REQUEST":
                        SceneManager.catchException(error);
                        break;
                    case "INTERNAL_SERVER_ERROR":
                    case "API_CALL_LIMIT_EXCEEDED":
                    default:
                        that._waitForScoreboardPlugin = false;
                        var message = error.message;
                        if (message.length > 27) {
                            message = message.slice(0, 27) + "\n" + message.slice(27);
                        }
                        recordsFromScoreboard = { errorMessage: message };
                        console.error(error);
                        break;
                    }
                });
            }
        } else if (command === "GetDataFromScoreboardRecords" || command === "スコア取得") {
            if (args.length < 2) {
                throw new Error("「" + command + "」コマンドでは、targetとvariableIdを両方指定してください");
            }
            var target = args[0];
            variableId = Number(args[1]);
            if (!isValidVariableId(variableId)) {
                throw new Error("「" + command + "」コマンドでは、variableIdには1～" + variableMax + "までの整数を指定してください。variableId: " + args[1]);
            }
            if (!recordsFromScoreboard) {
                $gameVariables.setValue(variableId, 0);
                return;
            }
            var result;
            try {
                result = (new Function("return this." + target)).call(recordsFromScoreboard);
            } catch (e) {
                //エラーは握りつぶしてuserNameだけ空データを入れる
                if (/\.userName$/.test(target)) {
                    result = "";
                }
            }
            switch(typeof result) {
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
    };
    var _Game_Interpreter_updateWait = Game_Interpreter.prototype.updateWait;
    Game_Interpreter.prototype.updateWait = function() {
        var result = _Game_Interpreter_updateWait.apply(this, arguments);
        return result || Boolean(this._waitForScoreboardPlugin);
    };
})();
