import { AtsumaruApiError } from "@atsumaru/api-types";
// 既存のクラスとメソッド名を取り、そのメソッドに処理を追加する
export function hook<T extends {[P in K]: Function}, K extends keyof T>(baseClass: {prototype: T}, target: K, f: (origin: T[K]) => T[K]) {
    baseClass.prototype[target] = f(baseClass.prototype[target]);
}

export function hookStatic<T extends {[P in K]: Function}, K extends keyof T>(baseClass: T, target: K, f: (origin: T[K]) => T[K]) {
    baseClass[target] = f(baseClass[target]);
}

// プラグインコマンドを追加する
export function addPluginCommand(commands: {[command: string]: (command: string, ...args: string[]) => void}) {
    hook(Game_Interpreter, "pluginCommand", origin => function(this: Game_Interpreter, command: string, args: string[]) {
        origin.apply(this, arguments as any);
        if (commands[command]) {
            commands[command].apply(this, [command, ...args]);
        }
    });
}

// Promiseが終了するまでイベントコマンドをウェイトするための処理を追加する
export function prepareBindPromise() {
    if (Game_Interpreter.prototype.bindPromiseForRPGAtsumaruPlugin) {
        return;
    }

    // Promiseを実行しつつ、それをツクールのインタプリタと結びつけて解決されるまで進行を止める
    Game_Interpreter.prototype.bindPromiseForRPGAtsumaruPlugin = function<T>(promise: Promise<T>, resolve?: (value: T) => void, reject?: (error: AtsumaruApiError) => void) {
        this._index--;
        this._promiseResolverForRPGAtsumaruPlugin = () => false;
        promise.then(
            value => this._promiseResolverForRPGAtsumaruPlugin = () => {
                this._index++;
                delete this._promiseResolverForRPGAtsumaruPlugin;
                if (resolve) {
                    resolve(value);
                }
                return true;
            },
            error => this._promiseResolverForRPGAtsumaruPlugin = () => {
                for (const key in this._eventInfo) {
                    error[key] = this._eventInfo[key];
                }
                error.line = this._index + 1;
                error.eventCommand = "plugin_command";
                error.content = this._params[0];
                switch (error.code) {
                case "BAD_REQUEST":
                    throw error;
                case "UNAUTHORIZED":
                case "FORBIDDEN":
                case "INTERNAL_SERVER_ERROR":
                case "API_CALL_LIMIT_EXCEEDED":
                default:
                    console.error(error.code + ": " + error.message);
                    console.error(error.stack);
                    if (Graphics._showErrorDetail && Graphics._formatEventInfo && Graphics._formatEventCommandInfo) {
                        const eventInfo = Graphics._formatEventInfo(error);
                        const eventCommandInfo = Graphics._formatEventCommandInfo(error);
                        console.error(eventCommandInfo ? eventInfo + ", " + eventCommandInfo : eventInfo);
                    }
                    this._index++;
                    delete this._promiseResolverForRPGAtsumaruPlugin;
                    if (reject) {
                        reject(error);
                    }
                    return true;
                }
            }
        );
    };

    // 通信待機中はこのコマンドで足踏みし、通信に成功または失敗した時にPromiseの続きを解決する
    // このタイミングまで遅延することで、以下のようなメリットが生まれる
    // １．解決が次のコマンドの直前なので、他の並列処理に結果を上書きされない
    // ２．ゲームループ内でエラーが発生するので、エラー発生箇所とスタックトレースが自然に詳細化される
    // ３．ソフトリセット後、リセット前のexecuteCommandは叩かれなくなるので、
    //     リセット前のPromiseのresolverがリセット後のグローバルオブジェクトを荒らす事故がなくなる
    hook(Game_Interpreter, "executeCommand", origin => function(this: Game_Interpreter) {
        if (this._promiseResolverForRPGAtsumaruPlugin) {
            const resolved = this._promiseResolverForRPGAtsumaruPlugin();
            if (!resolved) {
                return false;
            }
        }
        return origin.apply(this, arguments as any);
    });
}
