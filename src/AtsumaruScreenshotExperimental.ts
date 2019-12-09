/*:
 * @plugindesc RPGアツマールのスクリーンショットAPI操作のための(Experimental版)プラグインです
 * @author RPGアツマール開発チーム
 *
 * @param tweeted
 * @type variable
 * @text ツイートしたか
 * @desc プラグインコマンドの後、ここで指定した変数にモーダルからツイートした場合は1が、していない場合は0が代入されます。
 * @default 0
 *
 * @param tweetText
 * @type variable
 * @text ツイート文章
 * @desc ここで指定した変数に文章を代入すると、ツイート内容の文章部分が書き換わります。
 * @default 0
 *
 * @param param1
 * @type variable
 * @desc ここで指定した変数に値を代入すると、ツイート内容のゲームURLにクエリが付加されます。
 * @default 0
 *
 * @param param2
 * @type variable
 * @desc ここで指定した変数に値を代入すると、ツイート内容のゲームURLにクエリが付加されます。
 * @default 0
 *
 * @param param3
 * @type variable
 * @desc ここで指定した変数に値を代入すると、ツイート内容のゲームURLにクエリが付加されます。
 * @default 0
 *
 * @param param4
 * @type variable
 * @desc ここで指定した変数に値を代入すると、ツイート内容のゲームURLにクエリが付加されます。
 * @default 0
 *
 * @param param5
 * @type variable
 * @desc ここで指定した変数に値を代入すると、ツイート内容のゲームURLにクエリが付加されます。
 * @default 0
 *
 * @param param6
 * @type variable
 * @desc ここで指定した変数に値を代入すると、ツイート内容のゲームURLにクエリが付加されます。
 * @default 0
 *
 * @param param7
 * @type variable
 * @desc ここで指定した変数に値を代入すると、ツイート内容のゲームURLにクエリが付加されます。
 * @default 0
 *
 * @param param8
 * @type variable
 * @desc ここで指定した変数に値を代入すると、ツイート内容のゲームURLにクエリが付加されます。
 * @default 0
 *
 * @param param9
 * @type variable
 * @desc ここで指定した変数に値を代入すると、ツイート内容のゲームURLにクエリが付加されます。
 * @default 0
 *
 * @help
 * このプラグインは、アツマールAPIの「スクリーンショット撮影」を利用するためのプラグインです。
 * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/screenshot)を参照してください。
 *
 * プラグインコマンド:
 *   DisplayScreenshotModal         # スクリーンショットモーダルを表示
 *   スクリーンショットモーダル表示         # コマンド名が日本語のバージョンです。動作は上記コマンドと同じ
 *
 * ツイート文章の変更:
 *   プラグインパラメータ「ツイート文章」に変数の番号を指定しておくと、
 *   その変数の内容をスクリーンショットモーダル下部のツイート内容に反映させることができます。
 *   変数に文章を代入するには、「変数の操作」で「スクリプト」を選び、
 *   '文章' のように ' で囲む必要があります。下の例のように ' が含まれていることを確認してください。
 *
 *   例：◆変数の操作：#0001 ツイート文章 = 'このユーザーの運勢は【大吉】でした #占い'
 *     => ツイート内容が以下のようになります。
 *         このユーザーの運勢は【大吉】でした #占い #(ゲームID) #RPGアツマール (ゲームURL)
 *
 * ツイート内容のゲームURLにクエリを付与する:
 *   プラグインパラメータ「param1 - param9」に変数の番号を指定しておくと、
 *   その変数の内容をツイート内容のゲームURLにクエリを付加させることができます。
 *   クエリ取得プラグインなどと合わせて、ゲームURLを使って情報を受け渡すことができるので、
 *   ツイートからゲームを訪れた際に特殊な処理をしたりできます。
 *   詳しくはAPIリファレンス（このヘルプの最上部にアドレスがあります）をご参照ください。
 *
 */

import { toTypedParameters, ensureValidVariableIds } from "./utils/parameter";
import { hook, hookStatic, addPluginCommand, prepareBindPromise } from "./utils/rmmvbridge";
import { TweetSettings } from "@atsumaru/api-types";

interface Parameters {
    tweeted: number;
    tweetText: number;
    param1: number;
    param2: number;
    param3: number;
    param4: number;
    param5: number;
    param6: number;
    param7: number;
    param8: number;
    param9: number;
}

declare const window: Window;
const parameters = toTypedParameters(PluginManager.parameters("AtsumaruScreenshotExperimental")) as Parameters;
const variableIds = Object.keys(parameters).map(key => parameters[key as keyof Parameters]);
const screenshot = window.RPGAtsumaru && window.RPGAtsumaru.experimental && window.RPGAtsumaru.experimental.screenshot;
const displayModal = screenshot && screenshot.displayModal;
const setTweetMessage = screenshot && screenshot.setTweetMessage;

ensureValidVariableIds(parameters);
prepareBindPromise();

addPluginCommand({
    DisplayScreenshotModal,
    "スクリーンショットモーダル表示": DisplayScreenshotModal
});

function DisplayScreenshotModal(this: Game_Interpreter) {
    if (displayModal) {
        this.bindPromiseForRPGAtsumaruPlugin(displayModal(), result => $gameVariables.setValue(parameters.tweeted, result.tweeted ? 1 : 0));
    }
}

if (setTweetMessage) {
    hookStatic(DataManager, "createGameObjects", origin => function(this: typeof DataManager) {
        origin.apply(this, arguments as any);
        setTweetMessage(null);
    });

    hook(Scene_Title, "start", origin => function(this: Scene_Title) {
        origin.apply(this, arguments as any);
        setTweetMessage(null);
    });

    hook(Game_Variables, "setValue", origin => function(this: Game_Variables, variableId: number, _: any) {
        origin.apply(this, arguments as any);
        if (variableIds.indexOf(variableId) >= 0) {
            let tweetSettings: TweetSettings = {};
            for (const key in parameters) {
                const variableId = parameters[key as keyof Parameters];
                const value = $gameVariables.value(variableId);
                if (value) {
                    tweetSettings[key as keyof TweetSettings] = String(value);
                }
            }
            setTweetMessage(tweetSettings);
        }
    });
}
