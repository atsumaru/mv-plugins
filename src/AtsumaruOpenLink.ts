/*:
 * @plugindesc RPGアツマールで外部リンクを開くプラグインです
 * @author RPGアツマール開発チーム
 *
 * @help
 * このプラグインは、アツマールAPIの「外部リンク表示」を利用するためのプラグインです。
 * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/popup)を参照してください。
 *
 * プラグインコマンド:
 *   OpenLink <url>         # <url>で外部リンク表示を開く
 *   リンク表示 <url>         # コマンド名が日本語のバージョンです。動作は上記コマンドと同じ
 *
 * プラグインコマンド:
 *   OpenLink <url> <comment>         # <comment>に指定した内容の作者コメントとともに、<url>で外部リンク表示を開く
 *   リンク表示 <url> <comment>         # コマンド名が日本語のバージョンです。動作は上記コマンドと同じ
 */

import { addPluginCommand, prepareBindPromise } from "./utils/rmmvbridge";

declare const window: Window;
const openLink = window.RPGAtsumaru && window.RPGAtsumaru.popups.openLink;

prepareBindPromise();

addPluginCommand({
    OpenLink,
    "リンク表示": OpenLink
});

function OpenLink(this: Game_Interpreter, command: string, url?: string, comment?: string) {
    if (openLink) {
        this.bindPromiseForRPGAtsumaruPlugin(openLink(url!, comment));
    }
}
