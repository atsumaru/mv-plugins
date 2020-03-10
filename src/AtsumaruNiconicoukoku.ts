/*:
 * @plugindesc RPGアツマールでニコニ広告ポイントを取得するプラグインです
 * @author RPGアツマール開発チーム
 *
 * @param activePoint
 * @type variable
 * @text アクティブポイント
 * @desc 広告期間以内の広告ポイントを代入する変数の番号を指定します。
 * @default 0
 *
 * @param totalPoint
 * @type variable
 * @text トータルポイント
 * @desc 累計の広告ポイントを代入する変数の番号を指定します。
 * @default 0
 *
 * @param errorMessage
 * @type variable
 * @text エラーメッセージ
 * @desc エラーが発生した場合に、エラーメッセージを代入する変数の番号を指定します。
 * @default 0
 *
 * @help
 * このプラグインは、アツマールAPIの「ニコニ広告ポイント取得」を利用するためのプラグインです。
 * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/nicoad)を参照してください。
 *
 * プラグインコマンド:
 *   GetNicoadPoints         # ニコニ広告ポイント（アクティブポイントとトータルポイント）を取得する
 *   ニコニ広告ポイント取得         # コマンド名が日本語のバージョンです。動作は上記コマンドと同じ
 */

import { toTypedParameters, ensureValidVariableIds } from "./utils/parameter";
import { addPluginCommand, prepareBindPromise } from "./utils/rmmvbridge";

interface Parameters {
    activePoint: number
    totalPoint: number
    errorMessage: number
}

declare const window: Window;
const parameters = toTypedParameters(PluginManager.parameters("AtsumaruNiconicoukoku")) as Parameters;
const getPoints = window.RPGAtsumaru && window.RPGAtsumaru.nicoad.getPoints;

ensureValidVariableIds(parameters);
prepareBindPromise();

addPluginCommand({
    GetNicoadPoints,
    ニコニ広告ポイント取得: GetNicoadPoints
});

function GetNicoadPoints(this: Game_Interpreter) {
    if (getPoints) {
        this.bindPromiseForRPGAtsumaruPlugin(getPoints(),
            ({ activePoint, totalPoint }) => {
                $gameVariables.setValue(parameters.activePoint, activePoint);
                $gameVariables.setValue(parameters.totalPoint, totalPoint);
                $gameVariables.setValue(parameters.errorMessage, 0);
            },
            error => $gameVariables.setValue(parameters.errorMessage, error.message)
        );
    }
}
