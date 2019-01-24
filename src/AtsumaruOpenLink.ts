/*:
 * @plugindesc RPGアツマールで外部リンクを開くプラグインです
 * @author RPGアツマール開発チーム
 *
 * @help
 *
 * プラグインコマンド:
 *   OpenLink <url>         # <url>を開く
 *   リンク表示 <url>         # コマンド名が日本語のバージョンです。動作は上記コマンドと同じ
 */

import { addPluginCommand, prepareBindPromise } from "./utils/rmmvbridge";

declare const window: Window;
const openLink = window.RPGAtsumaru && window.RPGAtsumaru.popups.openLink;

prepareBindPromise();

addPluginCommand({
    OpenLink,
    "リンク表示": OpenLink
});

function OpenLink(this: Game_Interpreter, command: string, url?: string) {
    if (openLink) {
        this.bindPromiseForRPGAtsumaruPlugin(openLink(url!));
    }
}
