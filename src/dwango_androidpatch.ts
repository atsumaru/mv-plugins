/*:
 * Version
 * 1.1.0 2016.12.15
 * @plugindesc Android Chromeで音が鳴らない問題を解決するプラグイン
 * @author Dwango co., ltd.
 *
 * @help
 * Android Chromeで音が鳴らない問題を解決するプラグインです。
 * コアスクリプトでは https://github.com/rpgtkoolmv/corescript/pull/33 にて修正されています。
 */

import { hookStatic } from "./utils/rmmvbridge";

declare const document: any;

// contains dwango_ForceWebAudio effects
AudioManager.shouldUseHtml5Audio = function() {
    return false;
};
// for Android Chrome 55+
hookStatic(WebAudio, "_setupEventHandlers", origin => function(this: typeof WebAudio) {
    // BUG: Android Chrome 55+ treats touchstart as non-user gesture
    document.addEventListener("touchend", () => {
        const context = WebAudio._context;
        if (context && context.state === "suspended" && typeof context.resume === "function") {
            // Android Chrome 55+ need to call resume() in user gesture when state is suspended.
            context.resume().then(() => {
                // continue to default user gesture process
                WebAudio._onTouchStart();
            });
        } else {
            WebAudio._onTouchStart();
        }
    });
    origin.apply(this, arguments as any);
});
