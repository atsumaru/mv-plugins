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

import { toTypedParameters } from "./utils/parameter";
import { addPluginCommand, commonOnComment } from "./utils/rmmvbridge";

interface Parameters {
    verbose: boolean
    gposMode: string
    commonOnComment: number
    commentCommonOnComment: number
    commandCommonOnComment: number
    createdAtCommonOnComment: number
    isPostCommonOnComment: number
    isGiftCommonOnComment: number
    nameCommonOnComment: number
    pointCommonOnComment: number
    thanksCommonOnComment: number
    replyCommonOnComment: number
}

declare const window: Window;
const parameters = toTypedParameters(PluginManager.parameters("AtsumaruComment")) as Parameters;

addPluginCommand({
    SetGposMode,
    "gposモード設定": SetGposMode,
    SetScene,
    "シーン設定": SetScene,
    SetContext,
    "コンテキスト設定": SetContext,
});

if (window.RPGAtsumaru) {
    window.RPGAtsumaru.comment.verbose = parameters.verbose;
    window.RPGAtsumaru.comment.changeAutoGposMode(parameters.gposMode);
}

function SetGposMode(this: Game_Interpreter, _: string, mode: string) {
    if (window.RPGAtsumaru) {
        window.RPGAtsumaru.comment.changeAutoGposMode(mode);
    }
}

function SetScene(this: Game_Interpreter, _: string, sceneName: string) {
    if (window.RPGAtsumaru) {
        window.RPGAtsumaru.comment.changeScene(sceneName);
    }
}

function SetContext(this: Game_Interpreter, _: string, context: string) {
    if (window.RPGAtsumaru) {
        window.RPGAtsumaru.comment.setContext(context);
    }
}

commonOnComment(parameters);
