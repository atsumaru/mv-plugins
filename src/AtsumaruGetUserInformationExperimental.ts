/*:
 * @plugindesc RPGアツマールの特定ユーザーの情報を取得するAPIのための(Experimental版)プラグインです
 * @author RPGアツマール開発チーム
 *
 * @param name
 * @type variable
 * @text ユーザー名
 * @desc ユーザー情報取得時に、ユーザー名を代入する変数の番号を指定します。
 * @default 0
 *
 * @param profile
 * @type variable
 * @text 自己紹介
 * @desc ユーザー情報取得時に、自己紹介を代入する変数の番号を指定します。
 * @default 0
 *
 * @param twitterId
 * @type variable
 * @text TwitterID
 * @desc ユーザー情報取得時に、TwitterIDを代入する変数の番号を指定します。
 * @default 0
 *
 * @param url
 * @type variable
 * @text ウェブサイト
 * @desc ユーザー情報取得時に、ウェブサイトを代入する変数の番号を指定します。
 * @default 0
 *
 * @param errorMessage
 * @type variable
 * @text エラーメッセージ
 * @desc エラーが発生した場合に、エラーメッセージを代入する変数の番号を指定します。
 * @default 0
 *
 * @help
 * RPGアツマールで、指定したユーザーのプロフィールなどの情報を取得します。
 *
 * プラグインコマンド（英語版と日本語版のコマンドがありますが、どちらも同じ動作です）:
 *   GetUserInformation <userIdVariableId>
 *   特定ユーザー取得 <userIdVariableId>
 *      # 変数<userIdVariableId>からユーザーIDを読み取り、そのユーザーの情報を取得します。
 *      # 取得した情報は、プラグインパラメータで指定した変数IDに代入されます。
 *      # もしも情報が取得できなかった場合は、エラーメッセージが代入されます。
 *
 * アツマール外（テストプレイや他のサイト、ダウンロード版）での挙動:
 *      GetUserInformation（特定ユーザー取得）
 *          無視される（エラーメッセージにも何も代入されない）
 */

import { toNatural, toValidVariableId, toTypedParameters, ensureValidVariableIds } from "./utils/parameter";
import { addPluginCommand, prepareBindPromise } from "./utils/rmmvbridge";

interface Parameters {
    name: number
    profile: number
    twitterId: number
    url: number
    errorMessage: number
}

declare const window: Window;
const parameters = toTypedParameters(PluginManager.parameters("AtsumaruGetUserInformationExperimental")) as Parameters;
const getUserInformation = window.RPGAtsumaru && window.RPGAtsumaru.experimental && window.RPGAtsumaru.experimental.user && window.RPGAtsumaru.experimental.user.getUserInformation;

ensureValidVariableIds(parameters);
prepareBindPromise();

addPluginCommand({
    GetUserInformation,
    "特定ユーザー取得": GetUserInformation
});

function GetUserInformation(this: Game_Interpreter, command: string, userIdVariableIdStr?: string) {
    const userIdVariableId = toValidVariableId(userIdVariableIdStr, command, "userIdVariableId");
    const userId = toNatural($gameVariables.value(userIdVariableId), command, "userId");
    if (getUserInformation) {
        this.bindPromiseForRPGAtsumaruPlugin(getUserInformation(userId),
            userInformation => {
                $gameVariables.setValue(parameters.name, userInformation.name);
                $gameVariables.setValue(parameters.profile, userInformation.profile);
                $gameVariables.setValue(parameters.twitterId, userInformation.twitterId);
                $gameVariables.setValue(parameters.url, userInformation.url);
                $gameVariables.setValue(parameters.errorMessage, 0);
            },
            error => $gameVariables.setValue(parameters.errorMessage, error.message)
        );
    }
}
