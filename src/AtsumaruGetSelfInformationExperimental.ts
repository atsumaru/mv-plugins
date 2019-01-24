/*:
 * @plugindesc RPGアツマールのプレイヤー本人の情報を取得するAPIのための(Experimental版)プラグインです
 * @author RPGアツマール開発チーム
 *
 * @param id
 * @type variable
 * @text ユーザーID
 * @desc 自己情報取得時に、ユーザーIDを代入する変数の番号を指定します。
 * @default 0
 *
 * @param name
 * @type variable
 * @text ユーザー名
 * @desc 自己情報取得時に、ユーザー名を代入する変数の番号を指定します。
 * @default 0
 *
 * @param profile
 * @type variable
 * @text 自己紹介
 * @desc 自己情報取得時に、自己紹介を代入する変数の番号を指定します。
 * @default 0
 *
 * @param twitterId
 * @type variable
 * @text TwitterID
 * @desc 自己情報取得時に、TwitterIDを代入する変数の番号を指定します。
 * @default 0
 *
 * @param url
 * @type variable
 * @text ウェブサイト
 * @desc 自己情報取得時に、ウェブサイトを代入する変数の番号を指定します。
 * @default 0
 *
 * @param isPremium
 * @type variable
 * @text プレミアム会員か
 * @desc 自己情報取得時に、プレミアム会員かどうかを代入する変数の番号を指定します。(1 = プレミアム会員, 0 = 一般会員)
 * @default 0
 *
 * @param errorMessage
 * @type variable
 * @text エラーメッセージ
 * @desc エラーが発生した場合に、エラーメッセージを代入する変数の番号を指定します。
 * @default 0
 *
 * @help
 * RPGアツマールで、プレイヤー本人のプロフィールなどの情報を取得します。
 *
 * プラグインコマンド（英語版と日本語版のコマンドがありますが、どちらも同じ動作です）:
 *   GetSelfInformation
 *   プレイヤー取得
 *      # プレイヤー本人の情報を取得します。
 *      # 取得した情報は、プラグインパラメータで指定した変数IDに代入されます。
 *      # もしも情報が取得できなかった場合は、エラーメッセージが代入されます。
 *
 * アツマール外（テストプレイや他のサイト、ダウンロード版）での挙動:
 *      GetSelfInformation（プレイヤー取得）
 *          無視される（エラーメッセージにも何も代入されない）
 */

import { toTypedParameters, ensureValidVariableIds } from "./utils/parameter";
import { addPluginCommand, prepareBindPromise } from "./utils/rmmvbridge";

interface Parameters {
    id: number
    name: number
    profile: number
    twitterId: number
    url: number
    isPremium: number
    errorMessage: number
}

declare const window: Window;
const parameters = toTypedParameters(PluginManager.parameters("AtsumaruGetSelfInformationExperimental")) as Parameters;
const getSelfInformation = window.RPGAtsumaru && window.RPGAtsumaru.experimental && window.RPGAtsumaru.experimental.user && window.RPGAtsumaru.experimental.user.getSelfInformation;

ensureValidVariableIds(parameters);
prepareBindPromise();

addPluginCommand({
    GetSelfInformation,
    "プレイヤー取得": GetSelfInformation
});

function GetSelfInformation(this: Game_Interpreter) {
    if (getSelfInformation) {
        this.bindPromiseForRPGAtsumaruPlugin(getSelfInformation(),
            selfInformation => {
                $gameVariables.setValue(parameters.id, selfInformation.id);
                $gameVariables.setValue(parameters.name, selfInformation.name);
                $gameVariables.setValue(parameters.profile, selfInformation.profile);
                $gameVariables.setValue(parameters.twitterId, selfInformation.twitterId);
                $gameVariables.setValue(parameters.url, selfInformation.url);
                $gameVariables.setValue(parameters.isPremium, selfInformation.isPremium ? 1 : 0);
                $gameVariables.setValue(parameters.errorMessage, 0);
            },
            error => $gameVariables.setValue(parameters.errorMessage, error.message)
        );
    }
}
