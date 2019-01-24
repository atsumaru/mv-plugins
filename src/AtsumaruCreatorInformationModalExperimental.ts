/*:
 * @plugindesc RPGアツマールの作者情報ダイアログAPI操作のための(Experimental版)プラグインです
 * @author RPGアツマール開発チーム
 *
 * @help
 *
 * プラグインコマンド:
 *   DisplayCreatorInformationModal <niconicoUserId>        # 指定した<niconicoUserId>の作者情報ダイアログを表示します。省略した場合は現在のゲームの作者の作者情報ダイアログを表示します。
 *   作者情報ダイアログ表示 <niconicoUserId>        # コマンド名が日本語のバージョンです。動作は上記コマンドと同じ
 */

import { toNaturalOrUndefined } from "./utils/parameter";
import { addPluginCommand, prepareBindPromise } from "./utils/rmmvbridge";

declare const window: Window;
const displayCreatorInformationModal = window.RPGAtsumaru && window.RPGAtsumaru.experimental && window.RPGAtsumaru.experimental.popups && window.RPGAtsumaru.experimental.popups.displayCreatorInformationModal;

prepareBindPromise();

addPluginCommand({
    DisplayCreatorInformationModal,
    "作者情報ダイアログ表示": DisplayCreatorInformationModal
});

function DisplayCreatorInformationModal(this: Game_Interpreter, command: string, niconicoUserIdStr?: string) {
    const niconicoUserId = toNaturalOrUndefined(niconicoUserIdStr, command, "niconicoUserId");
    if (displayCreatorInformationModal) {
        if (niconicoUserId === undefined) {
            this.bindPromiseForRPGAtsumaruPlugin(displayCreatorInformationModal());
        } else {
            this.bindPromiseForRPGAtsumaruPlugin(displayCreatorInformationModal(niconicoUserId));
        }
    }
}
