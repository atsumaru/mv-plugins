/*:
 * @plugindesc ゲームアツマールのおれいポップアップAPI操作のためのプラグインです
 * @author ゲームアツマール開発チーム
 *
 * @param autoThanks
 * @type boolean
 * @text 自動表示
 * @desc おれいポップアップを一定時間経過後に自動で表示するかどうか設定します。
 * @default true
 *
 * @param thanksText
 * @type note
 * @text おれい文章
 * @desc おれいポップアップに表示される作者からのメッセージを指定します。
 *
 * @param thanksImage
 * @type file
 * @dir img/pictures
 * @require 1
 * @text おれい画像
 * @desc おれいポップアップに表示されるピクチャーを指定します。
 *
 * @param clapThanksText
 * @type note
 * @text 拍手おれい文章
 * @desc 拍手されたときにおれいポップアップに表示される作者からのメッセージを指定します。
 *
 * @param clapThanksImage
 * @type file
 * @dir img/pictures
 * @require 1
 * @text 拍手おれい画像
 * @desc 拍手されたときにおれいポップアップに表示されるピクチャーを指定します。
 *
 * @param giftThanksText
 * @type note
 * @text ギフトおれい文章
 * @desc ギフトされたときにおれいポップアップに表示される作者からのメッセージを指定します。
 *
 * @param giftThanksImage
 * @type file
 * @dir img/pictures
 * @require 1
 * @text ギフトおれい画像
 * @desc ギフトされたときにおれいポップアップに表示されるピクチャーを指定します。
 *
 * @help
 * このプラグインは、アツマールAPIの「おれいポップアップ」を利用するためのプラグインです。
 * 「おれいポップアップ」は作者がプレイヤーに感謝の気持ちを伝えられる機能であり、
 * プレイヤーはその気持ちを受け取って、『拍手』や『ギフト』で御礼と返事をすることが可能な機能です。
 * プラグインパラメータにより、おれいポップアップに表示する文章や画像を変更できます。
 * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/thanks-modal)を参照してください。
 *
 * プラグインコマンド:
 *   DisplayThanksModal        # おれいポップアップを表示します
 *   おれいポップアップ表示        # コマンド名が日本語のバージョンです。動作は上記コマンドと同じ
 */

import { toTypedParameters } from "./utils/parameter";
import { addPluginCommand, prepareBindPromise } from "./utils/rmmvbridge";

declare const window: Window;
const parameters = toTypedParameters(PluginManager.parameters("AtsumaruThanksModal")) as any;
const displayThanksModal = window.RPGAtsumaru && window.RPGAtsumaru.popups.displayThanksModal;
const setThanksSettings = window.RPGAtsumaru && window.RPGAtsumaru.popups.setThanksSettings;

if (setThanksSettings) {
    for (const key in parameters) {
        const value = parameters[key];
        if (value) {
            if (key.indexOf("Image") >= 0) {
                parameters[key] = `img/pictures/${value}.png`;
            }
        } else {
            delete parameters[key];
        }
    }
    setThanksSettings(parameters);
}

prepareBindPromise();

addPluginCommand({
    DisplayThanksModal,
    "おれいポップアップ表示": DisplayThanksModal
});

function DisplayThanksModal(this: Game_Interpreter) {
    if (displayThanksModal) {
        this.bindPromiseForRPGAtsumaruPlugin(displayThanksModal());
    }
}
