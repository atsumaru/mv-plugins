//=============================================================================
// dwango_androidpatch.js
//
// Copyright (c) 2018 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
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
     * Version
     * 1.1.0 2016.12.15
     * @plugindesc Android Chromeで音が鳴らない問題を解決するプラグイン
     * @author Dwango co., ltd.
     */
    // contains dwango_ForceWebAudio effects
    AudioManager.shouldUseHtml5Audio = function () {
        return false;
    };
    // for Android Chrome 55+
    hookStatic(WebAudio, "_setupEventHandlers", function (origin) { return function () {
        // BUG: Android Chrome 55+ treats touchstart as non-user gesture
        document.addEventListener("touchend", function () {
            var context = WebAudio._context;
            if (context && context.state === "suspended" && typeof context.resume === "function") {
                // Android Chrome 55+ need to call resume() in user gesture when state is suspended.
                context.resume().then(function () {
                    // continue to default user gesture process
                    WebAudio._onTouchStart();
                });
            }
            else {
                WebAudio._onTouchStart();
            }
        });
        origin.apply(this, arguments);
    }; });

}());
