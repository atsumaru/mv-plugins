/*:
 * @plugindesc RPGアツマールのグローバルシグナルのための(Experimental版)プラグインです
 * @author RPGアツマール開発チーム
 *
 * @param signalData
 * @type variable
 * @text シグナルデータ
 * @desc グローバルシグナルの取得時に、シグナルデータを代入する変数の番号を指定します。
 * @default 0
 *
 * @param senderId
 * @type variable
 * @text 送信者のユーザーID
 * @desc グローバルシグナルの取得時に、送信者のユーザーIDを代入する変数の番号を指定します。
 * @default 0
 *
 * @param senderName
 * @type variable
 * @text 送信者のユーザー名
 * @desc グローバルシグナルの取得時に、送信者のユーザー名を代入する変数の番号を指定します。
 * @default 0
 *
 * @param restCount
 * @type variable
 * @text 残シグナル数
 * @desc グローバルシグナルの取得時に、今取得したものを含めた残りのシグナル数を代入する変数の番号を指定します。
 * @default 0
 *
 * @param errorMessage
 * @type variable
 * @text エラーメッセージ
 * @desc エラーが発生した場合に、エラーメッセージを代入する変数の番号を指定します。
 * @default 0
 *
 * @help
 * このプラグインは、アツマールAPIの「グローバルシグナル」を利用するためのプラグインです。
 * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/signal)を参照してください。
 *
 * プラグインコマンド（英語版と日本語版のコマンドがありますが、どちらも同じ動作です）:
 *   SendGlobalSignal <signalDataVariableId>
 *   グローバルシグナル送信 <signalDataVariableId>
 *     # 変数<signalDataVariableId>からシグナルデータを読み取り、
 *          それをグローバルシグナルとして送信します。
 *     # 例: SendGlobalSignal 1
 *     #   : グローバルシグナル送信 1
 *
 *   GetGlobalSignal
 *   グローバルシグナル取得
 *      # まだ取得したことがないグローバルシグナルの中で最も古い一件を読み込み、
 *          プラグインパラメータで指定した変数に値をセットします。
 *      # 残シグナル数が0だった時は、シグナルデータと送信者のユーザーID/名前には0がセットされます。
 *      # 残シグナル数が0か1だった時は、次の取得コマンドで新たなシグナルの受信を試みますので
 *          時間がかかることがあります。スムーズに実行したい場合は、
 *          次の取得コマンドの実行（受信）までに１０秒以上の時間を空けてください。
 *      # 例: GetGlobalSignal
 *      #   : グローバルシグナル取得
 *
 * アツマール外（テストプレイや他のサイト、ダウンロード版）での挙動:
 *      SendGlobalSignal（グローバルシグナル送信）
 *          無視される（エラーメッセージにも何も代入されない）
 *      GetGlobalSignal（グローバルシグナル取得）
 *          無視される（エラーメッセージにも何も代入されない）
 *
 * ※「並列処理」の中でプラグインコマンドを利用しますと
 *   その時セーブしたセーブデータの状態が不確定になりますので、
 *   可能な限り「並列処理」以外のトリガーでご利用ください。
 */

import { isNumber } from "./utils/typecheck";
import { toValidVariableId, toTypedParameters, ensureValidVariableIds } from "./utils/parameter";
import { hookStatic, addPluginCommand, prepareBindPromise } from "./utils/rmmvbridge";
import { GlobalSignal } from "@atsumaru/api-types";

interface Parameters {
    signalData: number
    senderId: number
    senderName: number
    restCount: number
    errorMessage: number
}

interface GlobalSignalStore {
    signals: GlobalSignal[]
    lastPoppedSignals: GlobalSignal[]
}

declare const window: Window;
const parameters = toTypedParameters(PluginManager.parameters("AtsumaruGlobalSignalExperimental")) as Parameters;
const signal = window.RPGAtsumaru && window.RPGAtsumaru.experimental && window.RPGAtsumaru.experimental.signal;
const sendGlobalSignal = signal && signal.sendSignalToGlobal;
const getGlobalSignals = signal && signal.getGlobalSignals;

ensureValidVariableIds(parameters);
prepareBindPromise();

addPluginCommand({
    SendGlobalSignal,
    "グローバルシグナル送信": SendGlobalSignal,
    GetGlobalSignal,
    "グローバルシグナル取得": GetGlobalSignal
});

hookStatic(DataManager, "createGameObjects", origin => function(this: typeof DataManager) {
    origin.apply(this, arguments as any);
    initialFetch();
});

hookStatic(DataManager, "extractSaveContents", origin => function(this: typeof DataManager) {
    origin.apply(this, arguments as any);
    initialFetch();
});

function initialFetch() {
    if (!$gameSystem._globalSignalStoreForRPGAtsumaruPlugin && getGlobalSignals) {
        $gameSystem._globalSignalStoreForRPGAtsumaruPlugin = { signals: [], lastPoppedSignals: [] };
        fetchGlobalSignal(getGlobalSignals, $gameSystem._globalSignalStoreForRPGAtsumaruPlugin);
    }
}

function fetchGlobalSignal(getGlobalSignals: () => Promise<GlobalSignal[]>, store: GlobalSignalStore) {
    return getGlobalSignals().then(
        globalSignals => {
            globalSignals.sort((a, b) => b.createdAt - a.createdAt);
            if (store.lastPoppedSignals.length > 0) {
                const lastIndex = globalSignals.map(signal => signal.createdAt)
                    .lastIndexOf(store.lastPoppedSignals[0].createdAt);
                if (lastIndex !== -1) {
                    globalSignals = globalSignals.slice(0, lastIndex + 1);
                    difference(globalSignals, store.lastPoppedSignals);
                }
            }
            store.signals = globalSignals;
        }
    );
}

function difference(signals: GlobalSignal[], excludes: GlobalSignal[]) {
    const excludeIds = excludes.map(signal => signal.id);
    const excludeCreatedAt = excludes[0].createdAt;
    for (let index = signals.length - 1; index >= 0 && signals[index].createdAt === excludeCreatedAt; index--) {
        if (excludeIds.indexOf(signals[index].id) !== -1) {
            signals.splice(index, 1);
        }
    }
}

function SendGlobalSignal(this: Game_Interpreter, command: string, signalDataVariableIdStr?: string) {
    const signalDataVariableId = toValidVariableId(signalDataVariableIdStr, command, "signalDataVariableId");
    const signalData = String($gameVariables.value(signalDataVariableId));
    if (sendGlobalSignal) {
        this.bindPromiseForRPGAtsumaruPlugin(sendGlobalSignal(signalData),
            () => $gameVariables.setValue(parameters.errorMessage, 0),
            error => $gameVariables.setValue(parameters.errorMessage, error.message)
        );
    }
}

function GetGlobalSignal(this: Game_Interpreter) {
    if (getGlobalSignals) {
        const store = $gameSystem._globalSignalStoreForRPGAtsumaruPlugin;
        if (store.signals.length === 0) {
            this.bindPromiseForRPGAtsumaruPlugin(
                throttlePromise(() => fetchGlobalSignal(getGlobalSignals, store)),
                () => setGlobalSignal(store),
                error => $gameVariables.setValue(parameters.errorMessage, error.message)
            );
        } else {
            setGlobalSignal(store);
        }
    }
}

let lastApiCallTime = 0;
const apiCallInterval = 10000;
// Promiseの間隔が１０秒に１回を切るようなら間隔が開くようにPromiseの開始を遅延する
function throttlePromise<T>(promise: () => Promise<T>): Promise<T> {
    return new Promise<T>(resolve => {
        const delta = lastApiCallTime + apiCallInterval - Date.now();
        if (delta > 0) {
            setTimeout(() => resolve(throttlePromise(promise)), delta);
        } else {
            lastApiCallTime = Date.now();
            resolve(promise());
        }
    });
}

function setGlobalSignal(store: GlobalSignalStore) {
    $gameVariables.setValue(parameters.signalData, 0);
    $gameVariables.setValue(parameters.senderId, 0);
    $gameVariables.setValue(parameters.senderName, 0);
    $gameVariables.setValue(parameters.restCount, store.signals.length);
    $gameVariables.setValue(parameters.errorMessage, 0);
    const signal: GlobalSignal | undefined = store.signals.pop();
    if (signal) {
        $gameVariables.setValue(parameters.signalData, isNumber(signal.data) ? +signal.data : signal.data);
        $gameVariables.setValue(parameters.senderId, signal.senderId);
        $gameVariables.setValue(parameters.senderName, signal.senderName);
        if (store.lastPoppedSignals.length > 0 && store.lastPoppedSignals[0].createdAt !== signal.createdAt) {
            store.lastPoppedSignals = [];
        }
        store.lastPoppedSignals.push(signal);
    }
}
