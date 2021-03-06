/*:
 * @plugindesc RPGアツマールのギフトのためのプラグインです
 * @author RPGアツマール開発チーム
 *
 * @param totalPoint
 * @type variable
 * @text ギフト累計ポイント
 * @desc 「ギフト累計ポイント取得」コマンドで累計ポイントを代入する変数の番号を指定します。
 * @default 0
 *
 * @param myPoint
 * @type variable
 * @text ギフト自己ポイント
 * @desc 「ギフト自己ポイント取得」コマンドで自己ポイントを代入する変数の番号を指定します。
 * @default 0
 *
 * @param offsetHistories
 * @type variable
 * @text ギフト履歴(先頭)
 * @desc 「ギフト履歴取得」コマンドでギフト履歴の先頭を代入する変数の番号を指定します。
 * @default 1
 *
 * @param offsetRanking
 * @type variable
 * @text ギフトランキング(先頭)
 * @desc 「ギフトランキング取得」コマンドでギフトランキングの先頭を代入する変数の番号を指定します。
 * @default 1
 *
 * @param errorMessage
 * @type variable
 * @text エラーメッセージ
 * @desc エラーが発生した場合に、エラーメッセージを代入する変数の番号を指定します。
 * @default 0
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
 * このプラグインは、アツマールAPIの「ギフト」を利用するためのプラグインです。
 * 詳しくはアツマールAPIリファレンス(https://atsumaru.github.io/api-references/gift)を参照してください。
 *
 * プラグインコマンド（英語版と日本語版のコマンドがありますが、どちらも同じ動作です）:
 *   DisplayGiftModal
 *   ギフト投稿画面表示
 *      # ギフトを一覧表示し、投稿を促す画面を表示します。
 *
 *   GetGiftTotalPoint
 *   ギフト累計ポイント取得
 *      # このゲームのギフトを何ポイントギフトしたかが「ギフト累計ポイント」で指定した変数に代入されます。
 *
 *   GetGiftMyPoint
 *   ギフト自己ポイント取得
 *      # このゲームのギフトを自分が何ポイントギフトしたかが「ギフト自己ポイント」で指定した変数に代入されます。
 *
 *   GetGiftHistories
 *   ギフト履歴取得
 *      # 履歴を取得すると、変数1番～30番に新しい順に名前が代入され、
 *        変数31番～60番に(変数1番～30番に対応する)ポイントが代入されます。
 *      # ギフトが匿名で投稿された場合、ポイントは取得できますが名前には0が代入されます。
 *      # 履歴が30件に満たなかった場合、残りの変数には0が代入されます。
 *      # プラグインパラメータ「ギフト履歴(先頭)」を変更することで、代入先をずらすこともできます。
 *        例:201を指定すると変数201番～230番に名前が、231番～260番にギフトポイントが代入されます。
 *
 *   GetGiftRanking
 *   ギフトランキング取得
 *      # ランキングを取得すると、変数1番～5番に1位から順に名前が代入され、
 *        変数6番～10番に(変数1番～5番に対応する)ポイントが代入されます。
 *      # ギフトが匿名で投稿された場合、ポイントは取得できますが名前には0が代入されます。
 *      # ランキングが5件に満たなかった場合、残りの変数には0が代入されます。
 *      # プラグインパラメータ「ギフトランキング(先頭)」を変更することで、代入先をずらすこともできます。
 *        例:201を指定すると変数201番～205番に名前が、206番～210番にギフトポイントが代入されます。
 *      # ランキング取得は最大5「件」までです。同着があれば5位まで取得できるとは限りません。
 *        例:上から順に1位,1位,3位,4位,4位などのケース
 *
 * アツマール外（テストプレイや他のサイト、ダウンロード版）での挙動:
 *      DisplayGiftModal（ギフト投稿画面表示）
 *          無視される
 *      GetGiftTotalPoint（ギフト累計ポイント取得）
 *          無視される（エラーメッセージにも何も代入されない）
 *      GetGiftMyPoint（ギフト自己ポイント取得）
 *          無視される（エラーメッセージにも何も代入されない）
 *      GetGiftHistories（ギフト履歴取得）
 *          無視される（エラーメッセージにも何も代入されない）
 *      GetGiftRanking（ギフトランキング取得）
 *          無視される（エラーメッセージにも何も代入されない）
 */

import { toTypedParameters, ensureValidVariableIds } from "./utils/parameter";
import { addPluginCommand, commonOnComment, prepareBindPromise } from "./utils/rmmvbridge";
import { GiftHistories, GiftRanking } from "@atsumaru/api-types";

interface Parameters {
    totalPoint: number
    myPoint: number
    offsetHistories: number
    offsetRanking: number
    errorMessage: number
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
const parameters = toTypedParameters(PluginManager.parameters("AtsumaruGift")) as Parameters;
const getGiftDisplayCatalogModal = window.RPGAtsumaru && window.RPGAtsumaru.gift.displayCatalogModal;
const getGiftTotalPoints = window.RPGAtsumaru && window.RPGAtsumaru.gift.getTotalPoints;
const getGiftMyPoints = window.RPGAtsumaru && window.RPGAtsumaru.gift.getMyPoints;
const getGiftHistories = window.RPGAtsumaru && window.RPGAtsumaru.gift.getHistories;
const getGiftRanking = window.RPGAtsumaru && window.RPGAtsumaru.gift.getRanking;

{
    const { totalPoint, myPoint, offsetHistories, offsetRanking, errorMessage } = parameters;
    ensureValidVariableIds({ totalPoint, myPoint, offsetHistories, offsetRanking, errorMessage });
}
prepareBindPromise();

addPluginCommand({
    DisplayGiftModal,
    "ギフト投稿画面表示": DisplayGiftModal,
    GetGiftTotalPoint,
    "ギフト累計ポイント取得": GetGiftTotalPoint,
    GetGiftMyPoint,
    "ギフト自己ポイント取得": GetGiftMyPoint,
    GetGiftHistories,
    "ギフト履歴取得": GetGiftHistories,
    GetGiftRanking,
    "ギフトランキング取得": GetGiftRanking,
});

function DisplayGiftModal(this: Game_Interpreter) {
    if (getGiftDisplayCatalogModal) {
        getGiftDisplayCatalogModal();
    }
}

function GetGiftTotalPoint(this: Game_Interpreter) {
    if (getGiftTotalPoints) {
        this.bindPromiseForRPGAtsumaruPlugin(getGiftTotalPoints(),
            result => {
                $gameVariables.setValue(parameters.totalPoint, result);
                $gameVariables.setValue(parameters.errorMessage, 0);
            },
            error => $gameVariables.setValue(parameters.errorMessage, error.message)
        );
    }
}

function GetGiftMyPoint(this: Game_Interpreter) {
    if (getGiftMyPoints) {
        this.bindPromiseForRPGAtsumaruPlugin(getGiftMyPoints(),
            items => {
                let myPoint = 0;
                for (const itemCode in items) {
                    myPoint += items[itemCode];
                }
                $gameVariables.setValue(parameters.myPoint, myPoint);
                $gameVariables.setValue(parameters.errorMessage, 0);
            },
            error => $gameVariables.setValue(parameters.errorMessage, error.message)
        );
    }
}

function GetGiftHistories(this: Game_Interpreter) {
    if (getGiftHistories) {
        this.bindPromiseForRPGAtsumaruPlugin(getGiftHistories(),
            result => {
                for (let i = 0; i < 30; i++) {
                    const user = result[i] as GiftHistories[number] | undefined;
                    $gameVariables.setValue(parameters.offsetHistories + i, user ? user.userName : 0);
                    $gameVariables.setValue(parameters.offsetHistories + i + 30, user ? user.point : 0);
                }
                $gameVariables.setValue(parameters.errorMessage, 0);
            },
            error => $gameVariables.setValue(parameters.errorMessage, error.message)
        );
    }
}

function GetGiftRanking(this: Game_Interpreter) {
    if (getGiftRanking) {
        this.bindPromiseForRPGAtsumaruPlugin(getGiftRanking(),
            result => {
                for (let i = 0; i < 5; i++) {
                    const user = result[i] as GiftRanking[number] | undefined;
                    $gameVariables.setValue(parameters.offsetRanking + i, user ? user.userName : 0);
                    $gameVariables.setValue(parameters.offsetRanking + i + 5, user ? user.point : 0);
                }
                $gameVariables.setValue(parameters.errorMessage, 0);
            },
            error => $gameVariables.setValue(parameters.errorMessage, error.message)
        );
    }
}

commonOnComment(parameters);
