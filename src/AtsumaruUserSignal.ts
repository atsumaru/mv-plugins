/*:
 * @plugindesc RPGアツマールのユーザーシグナルのためのプラグインです
 * @author RPGアツマール開発チーム
 *
 * @param signalData
 * @type variable
 * @text シグナルデータ
 * @desc ユーザーシグナルの取得時に、シグナルデータを代入する変数の番号を指定します。
 * @default 0
 *
 * @param senderId
 * @type variable
 * @text 送信者のユーザーID
 * @desc ユーザーシグナルの取得時に、送信者のユーザーIDを代入する変数の番号を指定します。
 * @default 0
 *
 * @param senderName
 * @type variable
 * @text 送信者のユーザー名
 * @desc ユーザーシグナルの取得時に、送信者のユーザー名を代入する変数の番号を指定します。
 * @default 0
 *
 * @param restCount
 * @type variable
 * @text 残シグナル数
 * @desc ユーザーシグナルの取得時に、今取得したものを含めた残りのシグナル数を代入する変数の番号を指定します。
 * @default 0
 *
 * @param errorMessage
 * @type variable
 * @text エラーメッセージ
 * @desc エラーが発生した場合に、エラーメッセージを代入する変数の番号を指定します。
 * @default 0
 *
 * @help
 * このプラグインは、アツマールAPIの「ユーザーシグナル」を利用するためのプラグインです。
 * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/signal)を参照してください。
 *
 * プラグインコマンド（英語版と日本語版のコマンドがありますが、どちらも同じ動作です）:
 *   SendUserSignal <signalDataVariableId> <userIdVariableId>
 *   ユーザーシグナル送信 <signalDataVariableId> <userIdVariableId>
 *     # 変数<signalDataVariableId>からシグナルデータを読み取り、
 *          それを変数<userIdVariableId>から読み取ったユーザーIDの相手に送信します。
 *     # 例: SendUserSignal 1 2
 *     #   : ユーザーシグナル送信 1 2
 *
 *   GetUserSignal
 *   ユーザーシグナル取得
 *      # まだ取得したことがないユーザーシグナルの中で最も古い一件を読み込み、
 *          プラグインパラメータで指定した変数に値をセットします。
 *      # 残シグナル数が0だった時は、シグナルデータと送信者のユーザーID/名前には0がセットされます。
 *      # 残シグナル数が0か1だった時は、次の取得コマンドで新たなシグナルの受信を試みますので
 *          時間がかかることがあります。スムーズに実行したい場合は、
 *          次の取得コマンドの実行（受信）までに１０秒以上の時間を空けてください。
 *      # 例: GetUserSignal
 *      #   : ユーザーシグナル取得
 *
 * アツマール外（テストプレイや他のサイト、ダウンロード版）での挙動:
 *      SendUserSignal（ユーザーシグナル送信）
 *          無視される（エラーメッセージにも何も代入されない）
 *      GetUserSignal（ユーザーシグナル取得）
 *          無視される（エラーメッセージにも何も代入されない）
 *
 * ※「並列処理」の中でプラグインコマンドを利用しますと
 *   その時セーブしたセーブデータの状態が不確定になりますので、
 *   可能な限り「並列処理」以外のトリガーでご利用ください。
 */

import { isNumber } from "./utils/typecheck";
import { toNatural, toValidVariableId, toTypedParameters, ensureValidVariableIds } from "./utils/parameter";
import { hookStatic, addPluginCommand, prepareBindPromise } from "./utils/rmmvbridge";
import { UserSignal } from "@atsumaru/api-types";

interface Parameters {
    signalData: number
    senderId: number
    senderName: number
    restCount: number
    errorMessage: number
}

interface UserSignalStore {
    signals: UserSignal[]
    lastPoppedSignals: UserSignal[]
}

declare const window: Window;
const parameters = toTypedParameters(PluginManager.parameters("AtsumaruUserSignal")) as Parameters;
const signal = window.RPGAtsumaru && window.RPGAtsumaru.signal;
const sendUserSignal = signal && signal.sendSignalToUser;
const getUserSignals = signal && signal.getUserSignals;

ensureValidVariableIds(parameters);
prepareBindPromise();

addPluginCommand({
    SendUserSignal,
    "ユーザーシグナル送信": SendUserSignal,
    GetUserSignal,
    "ユーザーシグナル取得": GetUserSignal
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
    if (!$gameSystem._userSignalStoreForRPGAtsumaruPlugin && getUserSignals) {
        $gameSystem._userSignalStoreForRPGAtsumaruPlugin = { signals: [], lastPoppedSignals: [] };
        fetchUserSignal(getUserSignals, $gameSystem._userSignalStoreForRPGAtsumaruPlugin);
    }
}

function fetchUserSignal(getUserSignals: () => Promise<UserSignal[]>, store: UserSignalStore) {
    return getUserSignals().then(
        userSignals => {
            userSignals.sort((a, b) => b.createdAt - a.createdAt);
            if (store.lastPoppedSignals.length > 0) {
                const lastIndex = userSignals.map(signal => signal.createdAt)
                    .lastIndexOf(store.lastPoppedSignals[0].createdAt);
                if (lastIndex !== -1) {
                    userSignals = userSignals.slice(0, lastIndex + 1);
                    difference(userSignals, store.lastPoppedSignals);
                }
            }
            store.signals = userSignals;
        }
    );
}

function difference(signals: UserSignal[], excludes: UserSignal[]) {
    const excludeIds = excludes.map(signal => signal.id);
    const excludeCreatedAt = excludes[0].createdAt;
    for (let index = signals.length - 1; index >= 0 && signals[index].createdAt === excludeCreatedAt; index--) {
        if (excludeIds.indexOf(signals[index].id) !== -1) {
            signals.splice(index, 1);
        }
    }
}

function SendUserSignal(this: Game_Interpreter, command: string, signalDataVariableIdStr?: string, userIdVariableIdStr?: string) {
    const signalDataVariableId = toValidVariableId(signalDataVariableIdStr, command, "signalDataVariableId");
    const signalData = String($gameVariables.value(signalDataVariableId));
    const userIdVariableId = toValidVariableId(userIdVariableIdStr, command, "userIdVariableId");
    const userId = toNatural($gameVariables.value(userIdVariableId), command, "userId");
    if (sendUserSignal) {
        this.bindPromiseForRPGAtsumaruPlugin(sendUserSignal(userId, signalData),
            () => $gameVariables.setValue(parameters.errorMessage, 0),
            error => $gameVariables.setValue(parameters.errorMessage, error.message)
        );
    }
}

function GetUserSignal(this: Game_Interpreter) {
    if (getUserSignals) {
        const store = $gameSystem._userSignalStoreForRPGAtsumaruPlugin;
        if (store.signals.length === 0) {
            this.bindPromiseForRPGAtsumaruPlugin(
                throttlePromise(() => fetchUserSignal(getUserSignals, store)),
                () => setUserSignal(store),
                error => $gameVariables.setValue(parameters.errorMessage, error.message)
            );
        } else {
            setUserSignal(store);
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

function setUserSignal(store: UserSignalStore) {
    $gameVariables.setValue(parameters.signalData, 0);
    $gameVariables.setValue(parameters.senderId, 0);
    $gameVariables.setValue(parameters.senderName, 0);
    $gameVariables.setValue(parameters.restCount, store.signals.length);
    $gameVariables.setValue(parameters.errorMessage, 0);
    const signal: UserSignal | undefined = store.signals.pop();
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
