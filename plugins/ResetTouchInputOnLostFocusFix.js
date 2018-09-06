//=============================================================================
// ResetTouchInputOnLostFocusFix.js
//
// Copyright (c) 2018 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc Reset touch input on lost focus.
 * @author RPG Atsumaru development team
 */

/*:ja
 * @plugindesc ゲームがフォーカスを失った時、タッチ入力をリセットするように修正します。
 * @author RPGアツマール開発チーム
 */
(function() {
    'use strict';
    var _TouchInput__setupEventHandlers = TouchInput._setupEventHandlers;
    TouchInput._setupEventHandlers = function() {
        _TouchInput__setupEventHandlers.apply(this, arguments);
        window.addEventListener('blur', this.clear.bind(this));
    };
})();
