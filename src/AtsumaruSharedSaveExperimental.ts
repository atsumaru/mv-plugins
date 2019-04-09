/*:
 * @plugindesc RPGアツマールの共有セーブのための(Experimental版)プラグインです
 * @author RPGアツマール開発チーム
 *
 * @param startVariableId
 * @type variable
 * @text 共有セーブの保存範囲(開始)
 * @desc 「共有セーブ保存」コマンドで保存する変数の番号を指定します。
 * @default 0
 *
 * @param finishVariableId
 * @type variable
 * @text 共有セーブの保存範囲(終了)
 * @desc 「共有セーブ保存」コマンドで保存する変数の番号を指定します。
 * @default 0
 *
 * @param errorMessage
 * @type variable
 * @text エラーメッセージ
 * @desc エラーが発生した場合に、エラーメッセージを代入する変数の番号を指定します。
 * @default 0
 *
 * @help
 * このプラグインは、アツマールAPIの「共有セーブ」を利用するためのプラグインです。
 * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/shared-save)を参照してください。
 *
 * プラグインコマンド（英語版と日本語版のコマンドがありますが、どちらも同じ動作です）:
 *   SetSharedSave
 *   共有セーブ保存
 *      # 共有セーブの保存範囲(開始-終了)で指定した範囲の変数を読み込み、
 *          自分の共有セーブとして保存します。
 *      # 例: SetSharedSave
 *      #   : 共有セーブ保存
 *
 *   GetSharedSave <userIdVariableId> <startVariableId>
 *   共有セーブ取得 <userIdVariableId> <startVariableId>
 *      # 変数<userIdVariableId>からユーザーIDを読み取り、
 *          そのユーザーの共有セーブを<startVariableId>を先頭にして代入します。
 *      # 例: GetSharedSave 1 201
 *      #   : 共有セーブ取得 1 201
 *          （共有セーブの保存範囲が101-150で計50個の場合、変数1番に格納されたユーザーIDの人の共有セーブを201-250に代入）
 *
 * アツマール外（テストプレイや他のサイト、ダウンロード版）での挙動:
 *      SetSharedSave（共有セーブ保存）
 *          無視される（エラーメッセージにも何も代入されない）
 *      GetSharedSave（共有セーブ取得）
 *          無視される（エラーメッセージにも何も代入されない）
 *
 * 備考:
 * ・本プラグインは、共有セーブの保存領域をすべて使用します。
 *      そのため、共有セーブを活用する他のプラグインと共存することはできません。
 * ・ゲームを公開後に共有セーブの保存範囲を変更する時は、
 *      古い保存範囲のセーブデータとの互換性にご注意ください。
 *
 * ※「並列処理」の中でプラグインコマンドを利用しますと
 *   その時セーブしたセーブデータの状態が不確定になりますので、
 *   可能な限り「並列処理」以外のトリガーでご利用ください。
 */

import { toNatural, toTypedParameters, ensureValidVariableIds, toValidVariableId } from "./utils/parameter";
import { addPluginCommand, prepareBindPromise } from "./utils/rmmvbridge";

interface Parameters {
    startVariableId: number
    finishVariableId: number
    errorMessage: number
}

declare const window: Window;
const parameters = toTypedParameters(PluginManager.parameters("AtsumaruSharedSaveExperimental")) as Parameters;
const setItems = window.RPGAtsumaru && window.RPGAtsumaru.storage.setItems;
const getSharedItems = window.RPGAtsumaru && window.RPGAtsumaru.experimental && window.RPGAtsumaru.experimental.storage && window.RPGAtsumaru.experimental.storage.getSharedItems;

ensureValidVariableIds(parameters);
prepareBindPromise();

addPluginCommand({
    SetSharedSave,
    "共有セーブ保存": SetSharedSave,
    GetSharedSave,
    "共有セーブ取得": GetSharedSave
});

function SetSharedSave(this: Game_Interpreter) {
    const variables: any[] = [];
    for (let i = parameters.startVariableId; i <= parameters.finishVariableId; i++) {
        variables.push($gameVariables.value(i));
    }
    const value = JSON.stringify(variables);
    if (setItems) {
        this.bindPromiseForRPGAtsumaruPlugin(setItems([{ key: "Atsumaru Shared", value }]),
            () => $gameVariables.setValue(parameters.errorMessage, 0),
            error => $gameVariables.setValue(parameters.errorMessage, error.message)
        );
    }
}

function GetSharedSave(this: Game_Interpreter, command: string, userIdVariableIdStr?: string, startVariableIdStr?: string) {
    const userIdVariableId = toValidVariableId(userIdVariableIdStr, command, "userIdVariableId");
    const userId = toNatural($gameVariables.value(userIdVariableId), command, "userId");
    const startVariableId = toValidVariableId(startVariableIdStr, command, "startVariableId");
    if (getSharedItems) {
        this.bindPromiseForRPGAtsumaruPlugin(getSharedItems([userId]),
            sharedSaves => {
                if (sharedSaves[userId]) {
                    const variables = JSON.parse(sharedSaves[userId]);
                    for (let i = 0; i < variables.length; i++) {
                        $gameVariables.setValue(i + startVariableId, variables[i]);
                    }
                    $gameVariables.setValue(parameters.errorMessage, 0);
                } else {
                    $gameVariables.setValue(parameters.errorMessage, "指定したユーザーの共有セーブは見つかりませんでした");
                }
            },
            error => $gameVariables.setValue(parameters.errorMessage, error.message)
        );
    }
}
