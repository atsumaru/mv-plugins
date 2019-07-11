//=============================================================================
// AtsumaruAutoplayFix.js
//
// Copyright (c) 2018-2019 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

(function () {
    'use strict';

    // 既存のクラスとメソッド名を取り、そのメソッドに処理を追加する
    function hookStatic(baseClass, target, f) {
        baseClass[target] = f(baseClass[target]);
    }

    /*:
     * @plugindesc すべてのブラウザで自動再生起因による動画再生の失敗を修正するプラグインです。
     * @author RPGアツマール開発チーム
     *
     * @help
     * プラグインを有効にするだけで動画再生の修正を行います。
     * コミュニティ版コアスクリプトにて対応される修正
     * (https://github.com/rpgtkoolmv/corescript/pull/140)
     * の先行実装になります。
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
