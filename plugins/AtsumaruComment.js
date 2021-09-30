//=============================================================================
// AtsumaruComment.js
//
// Copyright (c) 2018-2021 ゲームアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

(function () {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __spreadArray(to, from) {
        for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
            to[j] = from[i];
        return to;
    }

    // 既存のクラスとメソッド名を取り、そのメソッドに処理を追加する
    function hook(baseClass, target, f) {
        baseClass.prototype[target] = f(baseClass.prototype[target]);
    }
    // プラグインコマンドを追加する
    function addPluginCommand(commands) {
        hook(Game_Interpreter, "pluginCommand", function (origin) { return function (command, args) {
            origin.apply(this, arguments);
            if (commands[command]) {
                commands[command].apply(this, __spreadArray([command], args));
            }
        }; });
    }
    // コメント・ギフトが流れたらコモンイベント起動
    function commonOnComment(parameters) {
        var commonOnComment = parameters.commonOnComment, commentCommonOnComment = parameters.commentCommonOnComment, commandCommonOnComment = parameters.commandCommonOnComment, createdAtCommonOnComment = parameters.createdAtCommonOnComment, isPostCommonOnComment = parameters.isPostCommonOnComment, isGiftCommonOnComment = parameters.isGiftCommonOnComment, nameCommonOnComment = parameters.nameCommonOnComment, pointCommonOnComment = parameters.pointCommonOnComment, thanksCommonOnComment = parameters.thanksCommonOnComment, replyCommonOnComment = parameters.replyCommonOnComment;
        if (commonOnComment && window.RPGAtsumaru) {
            var comments_1 = [];
            var _Game_Map_parallelCommonEvents_1 = Game_Map.prototype.parallelCommonEvents;
            Game_Map.prototype.parallelCommonEvents = function () {
                return _Game_Map_parallelCommonEvents_1.apply(this, arguments).concat($dataCommonEvents.find(function (commonEvent) { return commonEvent && commonOnComment === commonEvent.id; }));
            };
            var _Game_CommonEvent_isActive_1 = Game_CommonEvent.prototype.isActive;
            Game_CommonEvent.prototype.isActive = function () {
                return (commonOnComment === this._commonEventId && comments_1.length > 0) || _Game_CommonEvent_isActive_1.apply(this, arguments);
            };
            var _Game_CommonEvent_update_1 = Game_CommonEvent.prototype.update;
            Game_CommonEvent.prototype.update = function () {
                if (commonOnComment === this._commonEventId && comments_1.length > 0 && this._interpreter && !this._interpreter.isRunning()) {
                    var comment = comments_1.shift();
                    $gameVariables.setValue(commentCommonOnComment, comment.comment);
                    $gameVariables.setValue(commandCommonOnComment, comment.command);
                    $gameVariables.setValue(createdAtCommonOnComment, comment.createdAt);
                    $gameSwitches.setValue(isPostCommonOnComment, comment.createdAt === undefined);
                    $gameSwitches.setValue(isGiftCommonOnComment, comment.type === "gift");
                    $gameVariables.setValue(nameCommonOnComment, comment.name);
                    $gameVariables.setValue(pointCommonOnComment, comment.point);
                    $gameSwitches.setValue(thanksCommonOnComment, comment.thanks);
                    $gameVariables.setValue(replyCommonOnComment, comment.reply);
                    $gameMap.requestRefresh();
                }
                _Game_CommonEvent_update_1.apply(this, arguments);
            };
            window.RPGAtsumaru.comment.cameOut.subscribe(function (cameOut) { return (comments_1.push.apply(comments_1, cameOut), $gameMap.requestRefresh()); });
            window.RPGAtsumaru.comment.posted.subscribe(function (posted) { return (comments_1.push(posted), $gameMap.requestRefresh()); });
        }
    }

    function toTypedParameters(parameters, isArray) {
        if (isArray === void 0) { isArray = false; }
        var result = isArray ? [] : {};
        for (var key in parameters) {
            try {
                var value = JSON.parse(parameters[key]);
                result[key] = value instanceof Array ? toTypedParameters(value, true)
                    : value instanceof Object ? toTypedParameters(value)
                        : value;
            }
            catch (error) {
                result[key] = parameters[key];
            }
        }
        return result;
    }

    /*:
     * @plugindesc RPGアツマールのコメントのためのプラグインです
     * @author RPGアツマール開発チーム
     *
     * @param verbose
     * @type boolean
     * @text コメントgpos表示
     * @desc コメントgposの現在値をコンソールに表示します（verboseモード）。
     * @default false
     *
     * @param gposMode
     * @type select
     * @option v1
     * @option v2
     * @option v3
     * @option none
     * @default v3
     * @text コメントgposモード設定
     * @desc コメントのgposモードを設定します。noneで手動モード（自動変化なし）になります。
     *
     * @param commonOnComment
     * @type common_event
     * @text コメント・ギフトが流れたらコモンイベント起動
     * @desc 画面上にコメントやギフトが流れた時に、それを取得しつつ指定のコモンイベントを起動します。
     *
     * @param commentCommonOnComment
     * @type variable
     * @parent commonOnComment
     * @text *コメント
     * @desc コモンイベント起動時、この変数にコメントの内容を代入します。コメントがない場合、0を代入します
     *
     * @param commandCommonOnComment
     * @type variable
     * @parent commonOnComment
     * @text *コマンド
     * @desc コモンイベント起動時、この変数にコメントのコマンドを代入します。コマンドがない場合、0を代入します
     *
     * @param createdAtCommonOnComment
     * @type variable
     * @parent commonOnComment
     * @text *投稿時刻
     * @desc コモンイベント起動時、この変数にコメントの投稿時刻を代入します。時刻は1970年1月1日午前9時からの経過秒数で表されます
     *
     * @param isPostCommonOnComment
     * @type switch
     * @parent commonOnComment
     * @text *今投稿した？
     * @desc コモンイベント起動時、これが今このユーザー本人が投稿したものである場合このスイッチをONにします。
     *
     * @param isGiftCommonOnComment
     * @type switch
     * @parent commonOnComment
     * @text *ギフト？
     * @desc コモンイベント起動時、これがギフトである場合このスイッチをONにします。
     *
     * @param nameCommonOnComment
     * @type variable
     * @parent commonOnComment
     * @text *ユーザー名
     * @desc コモンイベント起動時、非匿名のギフトの場合、この変数にユーザー名を代入します。
     *
     * @param pointCommonOnComment
     * @type variable
     * @parent commonOnComment
     * @text *ギフトポイント
     * @desc コモンイベント起動時、ギフトの場合、この変数に消費ポイント（ギフトの価格）を代入します。
     *
     * @param thanksCommonOnComment
     * @type switch
     * @parent commonOnComment
     * @text *作者からのハート
     * @desc コモンイベント起動時、ギフトの場合、作者からのハートが贈られていればこのスイッチをONにします。
     *
     * @param replyCommonOnComment
     * @type variable
     * @parent commonOnComment
     * @text *作者からの返信
     * @desc コモンイベント起動時、ギフトの場合、この変数に作者からの返信を代入します。返信が(まだ)ない場合、0を代入します
     *
     * @help
     * このプラグインは、アツマールAPIの「コメント」を利用するためのプラグインです。
     * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/comment)を参照してください。
     *
     * プラグインコマンド（英語版と日本語版のコマンドがありますが、どちらも同じ動作です）:
     *   SetGposMode v1
     *   gposモード設定 v1
     *      # コメントのgposモードをgpos v1に設定します。
     *
     *   SetGposMode v2
     *   gposモード設定 v2
     *      # コメントのgposモードをgpos v2に設定します。
     *
     *   SetGposMode v3
     *   gposモード設定 v3
     *      # コメントのgposモードをgpos v3に設定します。
     *
     *   SetGposMode none
     *   gposモード設定 none
     *      # コメントのgposモードを手動（自動変化なし）に設定します。
     *
     *   SetScene <scene>
     *   シーン設定 <scene>
     *      # gposのsceneを<scene>に手動設定します。
     *
     *   SetContext <context>
     *   コンテキスト設定 <context>
     *      # gposのcontextを<context>に手動設定します。
     *
     * アツマール外（テストプレイや他のサイト、ダウンロード版）での挙動:
     *      SetGposMode（gposモード設定）
     *          無視される
     *      SetScene（シーン設定）
     *          無視される
     *      SetContext（コンテキスト設定）
     *          無視される
     */
    var parameters = toTypedParameters(PluginManager.parameters("AtsumaruComment"));
    addPluginCommand({
        SetGposMode: SetGposMode,
        "gposモード設定": SetGposMode,
        SetScene: SetScene,
        "シーン設定": SetScene,
        SetContext: SetContext,
        "コンテキスト設定": SetContext,
    });
    if (window.RPGAtsumaru) {
        window.RPGAtsumaru.comment.verbose = parameters.verbose;
        window.RPGAtsumaru.comment.changeAutoGposMode(parameters.gposMode);
    }
    function SetGposMode(_, mode) {
        if (window.RPGAtsumaru) {
            window.RPGAtsumaru.comment.changeAutoGposMode(mode);
        }
    }
    function SetScene(_, sceneName) {
        if (window.RPGAtsumaru) {
            window.RPGAtsumaru.comment.changeScene(sceneName);
        }
    }
    function SetContext(_, context) {
        if (window.RPGAtsumaru) {
            window.RPGAtsumaru.comment.setContext(context);
        }
    }
    commonOnComment(parameters);

}());
