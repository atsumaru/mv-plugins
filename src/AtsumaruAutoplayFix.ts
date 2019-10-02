/*:
 * @plugindesc すべてのブラウザで自動再生起因による動画再生の失敗を修正するプラグインです。
 * @author RPGアツマール開発チーム
 *
 * @help
 * Safariで「サウンド付きメディアは再生しない」設定の場合に、動画を無音で再生するプラグインです。
 * コアスクリプトでは https://github.com/rpgtkoolmv/corescript/pull/140 にて修正されています。
 */

import { hookStatic } from "./utils/rmmvbridge";

declare const document: any;

hookStatic(Graphics, "initialize", origin => function(this: typeof Graphics) {
    origin.apply(this, arguments as any);
    this._videoUnlocked = false;
});

let onTouchEndFired = false;
hookStatic(Graphics, "_onTouchEnd", origin => function(this: typeof Graphics) {
    if (!onTouchEndFired) {
        origin.apply(this, arguments as any);
        onTouchEndFired = true;
    }
});

hookStatic(Graphics, "_setupEventHandlers", origin => function(this: typeof Graphics) {
    origin.apply(this, arguments as any);

    // コア側が対応されたときに、二重で発火しないための仕掛
    const handler = () => {
        this._onTouchEnd();
        onTouchEndFired = false;
    };

    document.addEventListener("keydown", handler);
    document.addEventListener("mousedown", handler);
});

Graphics._onVideoLoad = function () {
    const promise = this._video.play();
    if (typeof promise !== "undefined" && typeof promise.catch === "function") {
        // エラーをコンソールに出力しないため、握りつぶしのみ行う
        promise.catch(() => {});
    }
    this._updateVisibility(true);
    this._videoLoading = false;
};

hookStatic(WebAudio, "_setupEventHandlers", origin => function(this: typeof WebAudio) {
    origin.apply(this, arguments as any);
    const resumeHandler = () => {
        const context = WebAudio._context;
        if (context && context.state === "suspended" && typeof context.resume === "function") {
            context.resume().then(() => {
                WebAudio._onTouchStart();
            });
        } else {
            WebAudio._onTouchStart();
        }
    };
    document.addEventListener("keydown", resumeHandler);
    document.addEventListener("mousedown", resumeHandler);
    document.addEventListener("touchend", resumeHandler);
});
