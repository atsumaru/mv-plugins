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
 * プラグインコマンド:
 *   SetRecordToScoreboard <boardId> <variableId>
 *      # 変数<variableId>をスコアから読み取り、スコアボード<boardId>にセットする。
 *      # 送信できるスコアの値は-2147483648～2147483647までの整数のみ。
 *      # 例: SetRecordToScoreboard 1 6
 * 
 *   SetRecordToScoreboard <boardId> <variableId> <errorVariableId>
 *      # 変数<variableId>をスコアから読み取り、スコアボード<boardId>にセットする。
 *      # 送信できるスコアの値は-2147483648～2147483647までの整数のみ。
 *      # また、変数<errorVariableId>に
 *          スコアの送信に失敗した場合はエラーメッセージ、成功した場合は0がセットされる
 *      # 例: SetRecordToScoreboard 1 6 7
 * 
 *   DisplayScoreboard <boardId>
 *      # スコアボード<boardId>を開く
 *      # 例: DisplayScoreboard 1
 * 
 *   FetchRecordsFromScoreboard <boardId>
 *      # スコアボード<boardId>をサーバから読み込んで準備する
 *      # 例: FetchRecordsFromScoreboard 1
 * 
 *   GetDataFromScoreboardRecords <target> <variableId>
 *      # 準備したスコアボードから<target>情報を読み込んで変数<variableId>にセットする。
 *      # 準備ができてない場合は0がセットされる。
 *      # 例: GetDataFromScoreboardRecords ranking[0].score 7
 *      boardId 1〜（ボードの数）までの整数　ボードの数の初期値は10
 *      target一覧
 *          myRecord # 今回の自己レコードがある場合は1、ない場合は0がセットされる
 *          myRecord.rank # 今回の自己レコードの順位、非ログイン時は0がセットされる
 *          myRecord.score # 今回の自己レコードのスコアがセットされる
 *          myRecord.isNewRecord # 今回の自己レコードが自己新記録なら1、そうでない場合は0がセットされる
 *          ranking.length # ランキングデータの長さ
 *          ranking[n].rank # n+1番目の人の順位がセットされる
 *          ranking[n].userName # n+1番目の人のユーザ名がセットされる
 *          ranking[n].score # n+1番目の人のスコアがセットされる
 *          myBestRecord # 自己最高記録がある場合は1、ない場合は0がセットされる
 *          myBestRecord.rank # 自己最高記録の順位、非ログイン時は0がセットされる
 *          myBestRecord.score # 自己最高記録のスコア、非ログイン時は0がセットされる
 *          errorMessage # スコアの読み込みに失敗した場合はエラーメッセージ、成功した場合は0がセットされる
 * 
 * スコアボードの仕様:
 *      プレミアム会員は永続保存される
 *      一般会員はボードごとに最新100ユーザしか保存されない
 * 
 * アツマール外（テストプレイや他のサイト、ダウンロード版）での挙動:
 *      SetRecordToScoreboard
 *          無視される（変数<errorVariableId>が指定されているなら即座に0がセットされる）
 *      DisplayScoreboard
 *          無視される
 *      FetchRecordsFromScoreboard
 *          無視される
 *      GetDataFromScoreboardRecords
 *          どの<target>を指定しても、結果はすべて0がセットされる
 */
(function() {
    'use strict';
    function isInt32(number) {
        return (number | 0) === number;
    }

    function isPositiveInt32(number) {
        return isInt32(number) && number > 0;
    }

    function isValidVariableId(variableId) {
        return isPositiveInt32(variableId) && variableId < $dataSystem.variables.length;
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
        if (command === "SetRecordToScoreboard") {
            if (args.length < 2) {
                throw new Error("SetRecordToScoreboardコマンドでは、boardIdとvariableIdを両方指定してください");
            }
            boardId = Number(args[0]);
            variableId = Number(args[1]);
            var errorVariableId = Number(args[2]);
            if (!isPositiveInt32(boardId)) {
                throw new Error("SetRecordToScoreboardコマンドでは、boardIdには1～2147483647までの整数を指定してください。boardId: " + args[0]);
            }
            if (!isValidVariableId(variableId)) {
                throw new Error("SetRecordToScoreboardコマンドでは、variableIdには1～" + variableMax + "までの整数を指定してください。variableId: " + args[1]);
            }
            if (args.length > 2 && !isValidVariableId(errorVariableId)) {
                throw new Error("SetRecordToScoreboardコマンドでは、errorVariableIdには1～" + variableMax + "までの整数を指定してください。errorVariableId: " + args[2]);
            }
            var score = $gameVariables.value(variableId);
            if (typeof score !== "number") {
                score = Number(score);
            }
            if (!isInt32(score)) {
                throw new Error("SetRecordToScoreboardコマンドでは、scoreには-2147483648～2147483647までの整数を指定してください。score: " + $gameVariables.value(variableId));
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
                            case "UNAUTHORIZED":
                            case "INTERNAL_SERVER_ERROR":
                            default:
                                that._waitForScoreboardPlugin = false;
                                if (args.length > 2) {
                                    $gameVariables.setValue(errorVariableId, error.message);
                                }
                                console.error(error);
                                break;
                        }
                    });
            } else if (args.length > 2) {
                $gameVariables.setValue(errorVariableId, 0);
            }
        } else if (command === "DisplayScoreboard") {
            if (args.length < 1) {
                throw new Error("DisplayScoreboardコマンドでは、boardIdを指定してください");
            }
            boardId = Number(args[0]);
            if (!isPositiveInt32(boardId)) {
                throw new Error("DisplayScoreboardコマンドでは、boardIdには1～2147483647までの整数を指定してください。boardId: " + args[0]);
            }
            if (displayDefined) {
                window.RPGAtsumaru.experimental.scoreboards.display(boardId);
            }
        } else if (command === "FetchRecordsFromScoreboard") {
            if (args.length < 1) {
                throw new Error("FetchRecordsFromScoreboardコマンドでは、boardIdを指定してください");
            }
            boardId = Number(args[0]);
            if (!isPositiveInt32(boardId)) {
                throw new Error("FetchRecordsFromScoreboardコマンドでは、boardIdには1～2147483647までの整数を指定してください。boardId: " + args[0]);
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
                        case "UNAUTHORIZED":
                        case "INTERNAL_SERVER_ERROR":
                        default:
                            that._waitForScoreboardPlugin = false;
                            recordsFromScoreboard = { errorMessage: error.message };
                            console.error(error);
                            break;
                    }
                });
            }
        } else if (command === "GetDataFromScoreboardRecords") {
            if (args.length < 2) {
                throw new Error("GetDataFromScoreboardRecordsコマンドでは、targetとvariableIdを両方指定してください");
            }
            var target = args[0];
            variableId = Number(args[1]);
            if (!isValidVariableId(variableId)) {
                throw new Error("GetDataFromScoreboardRecordsコマンドでは、variableIdには1～" + variableMax + "までの整数を指定してください。variableId: " + args[1]);
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
