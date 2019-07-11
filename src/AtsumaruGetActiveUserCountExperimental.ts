/*:
 * @plugindesc RPGアツマールのオンライン人数を取得するプラグインです
 * @author RPGアツマール開発チーム
 *
 * @param count
 * @type variable
 * @text オンライン人数
 * @desc オンライン人数を代入する変数の番号を指定します。
 * @default 1
 *
 * @param errorMessage
 * @type variable
 * @text エラーメッセージ
 * @desc エラーが発生した場合に、エラーメッセージを代入する変数の番号を指定します。
 * @default 0
 *
 * @help
 * このプラグインは、アツマールAPIの「オンライン人数を取得」を利用するためのプラグインです。
 * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/user)を参照してください。
 *
 * RPGアツマールで、今から1～60分前までの間にこのゲームを遊んでいるログインユーザーの人数をプラグインコマンドで取得します。
 *
 * プラグインコマンド（英語版と日本語版のコマンドがありますが、どちらも同じ動作です）:
 *   GetActiveUserCount <minutes>
 *   オンライン人数取得 <minutes>
 *      # 今から<minutes>分前までの間のオンライン人数を取得します。1～60までの整数を指定可能です。
 *      # 取得した情報は、プラグインパラメータで指定した変数IDに代入されます。
 *      # もしも情報が取得できなかった場合は、エラーメッセージが代入されます。
 */

import { toTypedParameters, toNatural } from "./utils/parameter";
import { addPluginCommand, prepareBindPromise } from "./utils/rmmvbridge";

interface Parameters {
    count: number
    errorMessage: number
}

declare const window: Window;
const parameters = toTypedParameters(PluginManager.parameters("AtsumaruGetActiveUserCountExperimental")) as Parameters;
const getActiveUserCount = window.RPGAtsumaru && window.RPGAtsumaru.experimental && window.RPGAtsumaru.experimental.user && window.RPGAtsumaru.experimental.user.getActiveUserCount;

prepareBindPromise();

addPluginCommand({
    GetActiveUserCount,
    "オンライン人数取得": GetActiveUserCount
});

function GetActiveUserCount(this: Game_Interpreter, command: string, minutesStr?: string) {
    const minutes = toNatural(minutesStr, command, "minutes");
    if (getActiveUserCount) {
        this.bindPromiseForRPGAtsumaruPlugin(getActiveUserCount(minutes),
            count => {
                $gameVariables.setValue(parameters.count, count);
                $gameVariables.setValue(parameters.errorMessage, 0);
            },
            error => $gameVariables.setValue(parameters.errorMessage, error.message)
        );
    }
}

