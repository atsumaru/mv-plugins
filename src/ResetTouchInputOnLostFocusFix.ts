/*:
 * @plugindesc ゲームがフォーカスを失った時、タッチ入力をリセットするように修正します。
 * @author RPGアツマール開発チーム
 */

import { hookStatic } from "./utils/rmmvbridge";

declare const window: any;

hookStatic(TouchInput, "_setupEventHandlers", origin => function(this: typeof TouchInput) {
    origin.apply(this, arguments as any);
    window.addEventListener("blur", () => this.clear());
});
