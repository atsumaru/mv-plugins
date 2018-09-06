//=============================================================================
// Dwango_AndroidAudioPatch.js
// ----------------------------------------------------------------------------
// Copyright (c) 2016 Dwango Co., Ltd.
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.1.0 2016.12.15
//=============================================================================
/*:
 * @plugindesc audio fix plugin for Android Chrome
 * @author Dwango co., ltd.
 */
/*:ja
 * @plugindesc Android Chromeで音が鳴らない問題を解決するプラグイン
 * @author Dwango co., ltd.
 */

(function(){
    // contains dwango_ForceWebAudio effects
    AudioManager.shouldUseHtml5Audio = function() {
        return false;
    };
    // for Android Chrome 55+
    _WebAudio__setupEventHandlers = WebAudio._setupEventHandlers;
    WebAudio._setupEventHandlers = function() {
        // BUG: Android Chrome 55+ treats touchstart as non-user gesture
        document.addEventListener("touchend", function() {
            var context = WebAudio._context;
            if (context && context.state === "suspended" && typeof context.resume === "function") {
                // Android Chrome 55+ need to call resume() in user gesture when state is suspended.
                context.resume().then(function() {
                    // continue to default user gesture process
                    WebAudio._onTouchStart();
                });
            } else {
                WebAudio._onTouchStart();
            }
        });
        return _WebAudio__setupEventHandlers.apply(this, arguments);
    };
})();
