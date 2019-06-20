//=============================================================================
// WheelFix.js
//
// Copyright (c) 2018 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

(function () {
    'use strict';

    /*:
     * @plugindesc マウスホイール動作の不具合を修正します。
     * @author RPGアツマール開発チーム
     *
     * @help
     * Google Chromeにてマウスホイールでゲーム画面そのものが
     * 上下にスクロールしてしまう不具合を修正します。
     * プラグインを有効にするだけで、修正を行います。
     *
     * コミュニティ版コアスクリプトにて対応される修正
     * (https://github.com/rpgtkoolmv/corescript/pull/202)
     * の先行実装になります。
     */
    var options = Object.defineProperty({}, "passive", {
        get: function () {
            document.addEventListener("wheel", function (event) { event.preventDefault(); }, { passive: false });
        }
    });
    window.addEventListener("test", function () { }, options);
    window.removeEventListener("test", function () { }, options);

}());
