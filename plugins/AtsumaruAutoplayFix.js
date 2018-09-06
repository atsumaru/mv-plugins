//=============================================================================
// AtsumaruAutoplayFix.js
//
// Copyright (c) 2018 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc すべてのブラウザで自動再生起因による動画再生の失敗を修正するプラグインです。 コアスクリプトの https://github.com/rpgtkoolmv/corescript/pull/140 こちらの修正の先行実装になります。
 * @author RPGアツマール開発チーム
 *
 * @help プラグインを有効にするだけで動画再生の修正を行います。
 */

(function () {
    var Graphics_initialize_original = Graphics.initialize;
    Graphics.initialize = function(width, height, type) { // eslint-disable-line no-unused-vars
        Graphics_initialize_original.apply(this, arguments);
        this._videoUnlocked = false;
    };

    var onTouchEndFired = false;
    var Graphics_onTouchEnd_original = Graphics._onTouchEnd;
    Graphics._onTouchEnd = function(event) { // eslint-disable-line no-unused-vars
        if (!onTouchEndFired) {
            Graphics_onTouchEnd_original.apply(this, arguments);
            onTouchEndFired = true;
        }
    };

    var Graphics_setupEventHandlers_original = Graphics._setupEventHandlers;
    Graphics._setupEventHandlers = function() {
        Graphics_setupEventHandlers_original.apply(this, arguments);

        var that = this;
        // コア側が対応されたときに、二重で発火しないための仕掛
        var handler = function() {
            that._onTouchEnd();
            onTouchEndFired = false;
        };

        document.addEventListener("keydown", handler);
        document.addEventListener("mousedown", handler);
    };

    Graphics._onVideoLoad = function () {
        var promise = this._video.play();
        if (typeof promise !== "undefined" && typeof promise.catch === "function") {
            // エラーをコンソールに出力しないため、握りつぶしのみ行う
            promise.catch(function() {});
        }
        this._updateVisibility(true);
        this._videoLoading = false;
    };

    var WebAudio_setupEventHandlers_original = WebAudio._setupEventHandlers;
    WebAudio._setupEventHandlers = function() {
        WebAudio_setupEventHandlers_original.apply(this, arguments);
        var resumeHandler = function() {
            var context = WebAudio._context;
            if (context && context.state === "suspended" && typeof context.resume === "function") {
                context.resume().then(function() {
                    WebAudio._onTouchStart();
                });
            } else {
                WebAudio._onTouchStart();
            }
        };
        document.addEventListener("keydown", resumeHandler);
        document.addEventListener("mousedown", resumeHandler);
        document.addEventListener("touchend", resumeHandler);
    };
})();
