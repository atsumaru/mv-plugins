//=============================================================================
// AtsumaruAutoplayFix.js
//
// Copyright (c) 2018-2021 ゲームアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

(function () {
    'use strict';

    function hookStatic(baseClass, target, f) {
        baseClass[target] = f(baseClass[target]);
    }

    /*:
     * @plugindesc すべてのブラウザで自動再生起因による動画再生の失敗を修正するプラグインです。
     * @author RPGアツマール開発チーム
     *
     * @help
     * Safariで「サウンド付きメディアは再生しない」設定の場合に、動画を無音で再生するプラグインです。
     * コアスクリプトでは https://github.com/rpgtkoolmv/corescript/pull/140 にて修正されています。
     */
    hookStatic(Graphics, "initialize", function (origin) { return function () {
        origin.apply(this, arguments);
        this._videoUnlocked = false;
    }; });
    var onTouchEndFired = false;
    hookStatic(Graphics, "_onTouchEnd", function (origin) { return function () {
        if (!onTouchEndFired) {
            origin.apply(this, arguments);
            onTouchEndFired = true;
        }
    }; });
    hookStatic(Graphics, "_setupEventHandlers", function (origin) { return function () {
        var _this = this;
        origin.apply(this, arguments);
        // コア側が対応されたときに、二重で発火しないための仕掛
        var handler = function () {
            _this._onTouchEnd();
            onTouchEndFired = false;
        };
        document.addEventListener("keydown", handler);
        document.addEventListener("mousedown", handler);
    }; });
    Graphics._onVideoLoad = function () {
        var promise = this._video.play();
        if (typeof promise !== "undefined" && typeof promise.catch === "function") {
            // エラーをコンソールに出力しないため、握りつぶしのみ行う
            promise.catch(function () { });
        }
        this._updateVisibility(true);
        this._videoLoading = false;
    };
    hookStatic(WebAudio, "_setupEventHandlers", function (origin) { return function () {
        origin.apply(this, arguments);
        var resumeHandler = function () {
            var context = WebAudio._context;
            if (context && context.state === "suspended" && typeof context.resume === "function") {
                context.resume().then(function () {
                    WebAudio._onTouchStart();
                });
            }
            else {
                WebAudio._onTouchStart();
            }
        };
        document.addEventListener("keydown", resumeHandler);
        document.addEventListener("mousedown", resumeHandler);
        document.addEventListener("touchend", resumeHandler);
    }; });

}());
