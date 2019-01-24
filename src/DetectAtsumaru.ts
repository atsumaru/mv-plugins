/*:
 * @plugindesc RPGアツマール環境かどうかを判定し、指定した変数に代入するプラグインです
 * @author RPGアツマール開発チーム
 *
 * @help
 *
 * プラグインコマンド:
 *   DetectAtsumaru <id>         # アツマール環境であれば1を、そうでなければ0を変数id1に代入
 *   アツマール判定 <id>          # 上記コマンドの日本語バージョン
 */

import { toValidVariableId } from "./utils/parameter";
import { addPluginCommand } from "./utils/rmmvbridge";

declare const window: Window;
const isRPGAtsumaru = window.RPGAtsumaru ? 1 : 0;

addPluginCommand({
    DetectAtsumaru,
    "アツマール判定": DetectAtsumaru
});

function DetectAtsumaru(command: string, idStr?: string) {
    $gameVariables.setValue(toValidVariableId(idStr, command, "id"), isRPGAtsumaru);
}
