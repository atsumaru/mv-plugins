/*:
 * @plugindesc RPGアツマールのプレイヤー間通信を有効化するプラグインです
 * @author RPGアツマール開発チーム
 *
 * @param errorMessage
 * @type variable
 * @text エラーメッセージ
 * @desc エラーが発生した場合に、エラーメッセージを代入する変数の番号を指定します。
 * @default 0
 *
 * @help
 * RPGアツマールのプレイヤー間通信をプラグインコマンドで有効化します。
 * 有効化したプレイヤーは、このゲーム内において以下のような機能が有効になります。
 * ・共有セーブやユーザー情報を他人が読み取れるようになる
 * ・他人から送信されたユーザーシグナルを受信できるようになる
 * ・「このゲームをプレイヤーした最新ユーザーリスト」に登録されるようになる
 *
 * プラグインコマンド:
 *   EnableInterplayer          # プレイヤー間通信を有効化します
 *   プレイヤー間通信有効化         # コマンド名が日本語のバージョンです。動作は上記コマンドと同じ
 *
 * アツマール外（テストプレイや他のサイト、ダウンロード版）での挙動:
 *   EnableInterplayer（プレイヤー間通信有効化）
 *     無視される（エラーメッセージにも何も代入されない）
 */

import { toTypedParameters, ensureValidVariableIds } from "./utils/parameter";
import { addPluginCommand, prepareBindPromise } from "./utils/rmmvbridge";

interface Parameters {
    errorMessage: number
}

declare const window: Window;
const parameters = toTypedParameters(PluginManager.parameters("AtsumaruEnableInterplayerExperimental")) as Parameters;
const enableInterplayer = window.RPGAtsumaru && window.RPGAtsumaru.experimental && window.RPGAtsumaru.experimental.interplayer && window.RPGAtsumaru.experimental.interplayer.enable;

ensureValidVariableIds(parameters);
prepareBindPromise();

addPluginCommand({
    EnableInterplayer,
    "プレイヤー間通信有効化": EnableInterplayer
});

function EnableInterplayer(this: Game_Interpreter) {
    if (enableInterplayer) {
        this.bindPromiseForRPGAtsumaruPlugin(enableInterplayer(),
            () => $gameVariables.setValue(parameters.errorMessage, 0),
            error => $gameVariables.setValue(parameters.errorMessage, error.message)
        );
    }
}
