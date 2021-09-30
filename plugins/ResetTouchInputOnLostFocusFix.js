//=============================================================================
// ResetTouchInputOnLostFocusFix.js
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
     * @plugindesc ゲームがフォーカスを失った時、タッチ入力をリセットするように修正します。
     * @author RPGアツマール開発チーム
     *
     * @help
     * ゲームがフォーカスを失った時、タッチ入力をリセットするように修正します。
     * コアスクリプトでは https://github.com/rpgtkoolmv/corescript/pull/184 にて取り込まれています。
     */
    hookStatic(TouchInput, "_setupEventHandlers", function (origin) { return function () {
        var _this = this;
        origin.apply(this, arguments);
        window.addEventListener("blur", function () { return _this.clear(); });
    }; });

}());
