/*:
 * @plugindesc RPGアツマールのグローバルサーバー変数のための(Experimental版)プラグインです
 * @author RPGアツマール開発チーム
 *
 * @param value
 * @type variable
 * @text 現在値
 * @desc グローバルサーバー変数の取得時に、現在値を代入する変数の番号を指定します。
 * @default 0
 *
 * @param minValue
 * @type variable
 * @text 最小値
 * @desc グローバルサーバー変数の取得時に、最小値を代入する変数の番号を指定します。
 * @default 0
 *
 * @param maxValue
 * @type variable
 * @text 最大値
 * @desc グローバルサーバー変数の取得時に、最大値を代入する変数の番号を指定します。
 * @default 0
 *
 * @param name
 * @type variable
 * @text 変数名
 * @desc グローバルサーバー変数の取得時に、変数名を代入する変数の番号を指定します。
 * @default 0
 *
 * @param errorMessage
 * @type variable
 * @text エラーメッセージ
 * @desc エラーが発生した場合に、エラーメッセージを代入する変数の番号を指定します。
 * @default 0
 *
 * @help
 * このプラグインは、アツマールAPIの「グローバルサーバー変数」を利用するためのプラグインです。
 * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/global-server-variable)を参照してください。
 *
 * プラグインコマンド（英語版と日本語版のコマンドがありますが、どちらも同じ動作です）:
 *   TriggerCall <triggerId>
 *   トリガー発動 <triggerId>
 *      # 指定した<triggerId>の「固定値を増減」型トリガーを発動させる
 *      # 例: TriggerCall 1
 *      #   : トリガー発動 1
 *
 *   TriggerCall <triggerId> <deltaVariableId>
 *   トリガー発動 <triggerId> <deltaVariableId>
 *     # 変数<deltaVariableId>から値を読み取り、指定した<triggerId>の「最大値・最小値の範囲で増減」型トリガー、または「値を代入」型トリガーを発動させる
 *     # 例: TriggerCall 1 5
 *     #   : トリガー発動 1 5
 *
 *   TriggerCallByName <globalServerVariableName> <triggerName>
 *   名前でトリガー発動 <globalServerVariableName> <triggerName>
 *      # 指定した<globalServerVariableName> <triggerName>の「固定値を増減」型トリガーを発動させる
 *      # 例: TriggerCallByName 変数1 トリガー名1
 *      #   : 名前でトリガー発動 変数1 トリガー名1
 *
 *   TriggerCallByName <globalServerVariableName> <triggerName> <valueVariableId>
 *   名前でトリガー発動 <globalServerVariableName> <triggerName> <valueVariableId>
 *     # 変数<valueVariableId>から値を読み取り、指定した<globalServerVariableName> <triggerName>の「最大値・最小値の範囲で増減」型トリガー、または「値を代入」型トリガーを発動させる
 *     # 例: TriggerCallByName 変数1 トリガー名1 5
 *     #   : 名前でトリガー発動 変数1 トリガー名1 5
 *
 *   GetGlobalServerVariable <globalServerVariableId>
 *   グローバルサーバー変数取得 <globalServerVariableId>
 *      # グローバルサーバー変数<globalServerVariableId>の情報（現在値・最小値・最大値・変数名）を読み込み、
 *          プラグインパラメータで指定した変数に値をセットする。
 *      # 例: GetGlobalServerVariable 1
 *      #   : グローバルサーバー変数取得 1
 *
 *   GetGlobalServerVariableByName <globalServerVariableName>
 *   名前でグローバルサーバー変数取得 <globalServerVariableName>
 *      # グローバルサーバー変数<globalServerVariableName>の情報（現在値・最小値・最大値・変数名）を読み込み、
 *          プラグインパラメータで指定した変数に値をセットする。
 *      # 例: GetGlobalServerVariableByName 変数1
 *      #   : 名前でグローバルサーバー変数取得 変数1
 *
 * アツマール外（テストプレイや他のサイト、ダウンロード版）での挙動:
 *      TriggerCall（トリガー発動）
 *          無視される（エラーメッセージにも何も代入されない）
 *      GetGlobalServerVariable（グローバルサーバー変数取得）
 *          無視される（エラーメッセージにも何も代入されない）
 *
 * ※「並列処理」の中でプラグインコマンドを利用しますと
 *   その時セーブしたセーブデータの状態が不確定になりますので、
 *   可能な限り「並列処理」以外のトリガーでご利用ください。
 */

import { toInteger, toNatural, toValidVariableIdOrUndefined, toTypedParameters, ensureValidVariableIds } from "./utils/parameter";
import { addPluginCommand, prepareBindPromise } from "./utils/rmmvbridge";

interface Parameters {
    value: number
    minValue: number
    maxValue: number
    name: number
    errorMessage: number
}

declare const window: Window;
const parameters = toTypedParameters(PluginManager.parameters("AtsumaruGlobalServerVariableExperimental")) as Parameters;
const globalServerVariable = window.RPGAtsumaru && window.RPGAtsumaru.experimental && window.RPGAtsumaru.experimental.globalServerVariable;
const triggerCall = globalServerVariable && globalServerVariable.triggerCall;
const triggerCallByName = globalServerVariable && globalServerVariable.triggerCallByName;
const getGlobalServerVariable = globalServerVariable && globalServerVariable.getGlobalServerVariable;
const getGlobalServerVariableByName = globalServerVariable && globalServerVariable.getGlobalServerVariableByName;

ensureValidVariableIds(parameters);
prepareBindPromise();

addPluginCommand({
    TriggerCall,
    "トリガー発動": TriggerCall,
    TriggerCallByName,
    "名前でトリガー発動": TriggerCallByName,
    GetGlobalServerVariable,
    "グローバルサーバー変数取得": GetGlobalServerVariable,
    GetGlobalServerVariableByName,
    "名前でグローバルサーバ変数取得": GetGlobalServerVariableByName
});

function TriggerCall(this: Game_Interpreter, command: string, triggerIdStr?: string, deltaVariableIdStr?: string) {
    const triggerId = toNatural(triggerIdStr, command, "triggerId");
    const deltaVariableId = toValidVariableIdOrUndefined(deltaVariableIdStr, command, "deltaVariableId");
    if (triggerCall) {
        if (deltaVariableId === undefined) {
            this.bindPromiseForRPGAtsumaruPlugin(triggerCall(triggerId),
                () => $gameVariables.setValue(parameters.errorMessage, 0),
                error => $gameVariables.setValue(parameters.errorMessage, error.message)
            );
        } else {
            const delta = $gameVariables.value(deltaVariableId);
            this.bindPromiseForRPGAtsumaruPlugin(triggerCall(triggerId, delta),
                () => $gameVariables.setValue(parameters.errorMessage, 0),
                error => $gameVariables.setValue(parameters.errorMessage, error.message)
            );
        }
    }
}


function TriggerCallByName(this: Game_Interpreter, command: string, globalServerVariableName: string = "" , triggerName: string = "", valueVariableIdStr?: string) {
    const valueVariableId = toValidVariableIdOrUndefined(valueVariableIdStr, command, "valueVariableId");
    if (triggerCallByName) {
        if (valueVariableId === undefined) {
            this.bindPromiseForRPGAtsumaruPlugin(triggerCallByName(globalServerVariableName, triggerName),
                () => $gameVariables.setValue(parameters.errorMessage, 0),
                error => $gameVariables.setValue(parameters.errorMessage, error.message)
            );
        } else {
            const value = $gameVariables.value(valueVariableId);
            this.bindPromiseForRPGAtsumaruPlugin(triggerCallByName(globalServerVariableName, triggerName, value),
                () => $gameVariables.setValue(parameters.errorMessage, 0),
                error => $gameVariables.setValue(parameters.errorMessage, error.message)
            );
        }
    }
}

function GetGlobalServerVariable(this: Game_Interpreter, command: string, globalServerVariableIdStr?: string) {
    const globalServerVariableId = toNatural(globalServerVariableIdStr, command, "globalServerVariableId");
    if (getGlobalServerVariable) {
        this.bindPromiseForRPGAtsumaruPlugin(getGlobalServerVariable(globalServerVariableId),
            globalServerVariable => {
                $gameVariables.setValue(parameters.value, globalServerVariable.value);
                $gameVariables.setValue(parameters.minValue, globalServerVariable.minValue);
                $gameVariables.setValue(parameters.maxValue, globalServerVariable.maxValue);
                $gameVariables.setValue(parameters.name, globalServerVariable.name);
                $gameVariables.setValue(parameters.errorMessage, 0);
            },
            error => $gameVariables.setValue(parameters.errorMessage, error.message)
        );
    }
}


function GetGlobalServerVariableByName(this: Game_Interpreter, command: string, globalServerVariableName: string = "") {
    if (getGlobalServerVariableByName) {
        this.bindPromiseForRPGAtsumaruPlugin(getGlobalServerVariableByName(globalServerVariableName),
            globalServerVariable => {
                $gameVariables.setValue(parameters.value, globalServerVariable.value);
                $gameVariables.setValue(parameters.minValue, globalServerVariable.minValue);
                $gameVariables.setValue(parameters.maxValue, globalServerVariable.maxValue);
                $gameVariables.setValue(parameters.name, globalServerVariable.name);
                $gameVariables.setValue(parameters.errorMessage, 0);
            },
            error => $gameVariables.setValue(parameters.errorMessage, error.message)
        );
    }
}
