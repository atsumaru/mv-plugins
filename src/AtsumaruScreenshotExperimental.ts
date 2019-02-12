/*:
 * @plugindesc RPGアツマールのスクリーンショットAPI操作のための(Experimental版)プラグインです
 * @author RPGアツマール開発チーム
 *
 * @help
 * このプラグインは、アツマールAPIの「スクリーンショット撮影」を利用するためのプラグインです。
 * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/screenshot)を参照してください。
 *
 * プラグインコマンド:
 *   DisplayScreenshotModal         # スクリーンショットモーダルを表示
 *   スクリーンショットモーダル表示         # コマンド名が日本語のバージョンです。動作は上記コマンドと同じ
 */

import { addPluginCommand, prepareBindPromise } from "./utils/rmmvbridge";

declare const window: Window;
const displayModal = window.RPGAtsumaru && window.RPGAtsumaru.experimental && window.RPGAtsumaru.experimental.screenshot && window.RPGAtsumaru.experimental.screenshot.displayModal;

prepareBindPromise();

addPluginCommand({
    DisplayScreenshotModal,
    "スクリーンショットモーダル表示": DisplayScreenshotModal
});

function DisplayScreenshotModal(this: Game_Interpreter) {
    if (displayModal) {
        this.bindPromiseForRPGAtsumaruPlugin(displayModal());
    }
}
