//=============================================================================
// SafariMovieFix.js
//
// Copyright (c) 2018-2021 ゲームアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

(function () {
    'use strict';

    /*:
     * deprecated
     *
     * @plugindesc Safariで「サウンド付きメディアは再生しない」設定の場合に、動画を無音で再生するプラグイン
     * @author RPGアツマール開発チーム
     *
     * @help
     * すべてのブラウザで自動再生起因による動画再生の失敗を修正するプラグインです。
     * コアスクリプトでは https://github.com/rpgtkoolmv/corescript/pull/140 にて修正されています。
     */
    Graphics._onVideoLoad = function () {
        var _this = this;
        // まず音声有りでの再生を試みる
        this._video.muted = false;
        // 古いブラウザではvideo.play()がPromiseを返さないため、Promiseでラップしてからcatchする
        Promise.resolve()
            .then(function () { return _this._video.play(); })
            .catch(function (e) {
            // 失敗し、NotAllowedErrorだった場合、音声無しでの再生を試みる
            if (e.name === "NotAllowedError") {
                _this._video.muted = true;
                return Promise.resolve()
                    .then(function () { return _this._video.play(); });
            }
            return Promise.reject(e);
        })
            .catch(function () {
            // それでも失敗した場合、ゲームを再開させる
            _this._updateVisibility(false);
            _this._videoLoading = false;
        });
        this._updateVisibility(true);
        this._videoLoading = false;
    };

}());
