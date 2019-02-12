/*:
 * @plugindesc RPGアツマールの最新ユーザーを取得するプラグインです
 * @author RPGアツマール開発チーム
 *
 * @param offset
 * @type variable
 * @text 最新ユーザー(先頭)
 * @desc 最新ユーザーの先頭を代入する変数の番号を指定します。例:201を指定すると変数201番～300番にIDが、301番～400番に名前が代入されます
 * @default 1
 *
 * @param errorMessage
 * @type variable
 * @text エラーメッセージ
 * @desc エラーが発生した場合に、エラーメッセージを代入する変数の番号を指定します。
 * @default 0
 *
 * @help
 * このプラグインは、アツマールAPIの「最新ユーザー取得」を利用するためのプラグインです。
 * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/user)を参照してください。
 *
 * RPGアツマールで、最近このゲームを遊んだプレイヤーをプラグインコマンドで取得します。
 * ・このゲームにおいてプレイヤー間通信を有効化しているプレイヤーのIDと名前を、
 * ・このゲームを最後に（最近）遊んだ順に、
 * ・最大１００人まで
 * 取得することができます。
 *
 * プラグインコマンド:
 *   GetRecentUsers          # 最新ユーザーを取得します
 *   最新ユーザー取得         # コマンド名が日本語のバージョンです。動作は上記コマンドと同じ
 *
 * ユーザーを取得すると、変数1番～100番に新しい順にユーザーIDが代入され、
 * 変数101番～200番にIDに対応するユーザー名が代入されます。
 * ユーザーが100人に満たなかった場合、残りの変数には0が代入されます。
 * （プラグインパラメータ「最新ユーザー(先頭)」を変更することで、代入先をずらすこともできます）
 *
 * アツマール外（テストプレイや他のサイト、ダウンロード版）での挙動:
 *   GetRecentUsers（最新ユーザー取得）
 *     無視される（エラーメッセージにも何も代入されない）
 */

import { toTypedParameters, ensureValidVariableIds } from "./utils/parameter";
import { addPluginCommand, prepareBindPromise } from "./utils/rmmvbridge";
import { UserIdName } from "@atsumaru/api-types";

interface Parameters {
    offset: number
    errorMessage: number
}

declare const window: Window;
const parameters = toTypedParameters(PluginManager.parameters("AtsumaruGetRecentUsersExperimental")) as Parameters;
const getRecentUsers = window.RPGAtsumaru && window.RPGAtsumaru.experimental && window.RPGAtsumaru.experimental.user && window.RPGAtsumaru.experimental.user.getRecentUsers;

ensureValidVariableIds(parameters);
prepareBindPromise();

addPluginCommand({
    GetRecentUsers,
    "最新ユーザー取得": GetRecentUsers
});

function GetRecentUsers(this: Game_Interpreter) {
    if (getRecentUsers) {
        this.bindPromiseForRPGAtsumaruPlugin(getRecentUsers(),
            recentUsers => {
                for (let i = 0; i < 100; i++) {
                    const user = recentUsers[i] as UserIdName | undefined;
                    $gameVariables.setValue(parameters.offset + i, user ? user.id : 0);
                    $gameVariables.setValue(parameters.offset + i + 100, user ? user.name : 0);
                }
                $gameVariables.setValue(parameters.errorMessage, 0);
            },
            error => $gameVariables.setValue(parameters.errorMessage, error.message)
        );
    }
}
