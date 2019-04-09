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
import { toDefined, toInteger, toNatural, toValidVariableId, toValidVariableIdOrUndefined } from "./utils/parameter";
import { addPluginCommand, prepareBindPromise } from "./utils/rmmvbridge";
import { ScoreboardData } from "@atsumaru/api-types";

declare const window: Window;
const scoreboards = window.RPGAtsumaru && window.RPGAtsumaru.experimental && window.RPGAtsumaru.experimental.scoreboards;
const setRecord = scoreboards && scoreboards.setRecord;
const display = scoreboards && scoreboards.display;
const getRecords = scoreboards && scoreboards.getRecords;
let recordsFromScoreboard: ScoreboardData | { errorMessage: string } | null = null;

prepareBindPromise();

addPluginCommand({
    SetRecordToScoreboard,
    "スコア送信": SetRecordToScoreboard,
    DisplayScoreboard,
    "スコア表示": DisplayScoreboard,
    FetchRecordsFromScoreboard,
    "スコア受信": FetchRecordsFromScoreboard,
    GetDataFromScoreboardRecords,
    "スコア取得": GetDataFromScoreboardRecords
});

function SetRecordToScoreboard(this: Game_Interpreter, command: string, boardIdStr?: string, variableIdStr?: string, errorVariableIdStr?: string) {
    const boardId = toNatural(boardIdStr, command, "boardId");
    const variableId = toValidVariableId(variableIdStr, command, "variableId");
    const errorVariableId = toValidVariableIdOrUndefined(errorVariableIdStr, command, "errorVariableId");
    const score = toInteger($gameVariables.value(variableId), command, "score");
    if (setRecord) {
        if (errorVariableId === undefined) {
            this.bindPromiseForRPGAtsumaruPlugin(setRecord(boardId, score));
        } else {
            this.bindPromiseForRPGAtsumaruPlugin(setRecord(boardId, score),
                () => $gameVariables.setValue(errorVariableId, 0),
                error => $gameVariables.setValue(errorVariableId, error.message)
            );
        }
    }
}

function DisplayScoreboard(this: Game_Interpreter, command: string, boardIdStr?: string) {
    const boardId = toNatural(boardIdStr, command, "boardId");
    if (display) {
        this.bindPromiseForRPGAtsumaruPlugin(display(boardId));
    }
}

function FetchRecordsFromScoreboard(this: Game_Interpreter, command: string, boardIdStr?: string) {
    const boardId = toNatural(boardIdStr, command, "boardId");
    if (getRecords) {
        this.bindPromiseForRPGAtsumaruPlugin(getRecords(boardId),
            value => recordsFromScoreboard = value,
            error => recordsFromScoreboard = { errorMessage: error.message }
        );
    }
}

function GetDataFromScoreboardRecords(this: Game_Interpreter, command: string, target?: string, variableIdStr?: string) {
    target = toDefined(target, command, "target");
    const variableId = toValidVariableId(variableIdStr, command, "variableId");
    if (!recordsFromScoreboard) {
        $gameVariables.setValue(variableId, 0);
        return;
    }
    let result;
    try {
        result = (new Function("return this." + target)).call(recordsFromScoreboard);
    } catch (e) {
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
