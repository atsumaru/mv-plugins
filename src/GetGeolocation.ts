/*:
 * @plugindesc プレイヤーの位置情報を取得します。
 * @author RPGアツマール開発チーム
 *
 * @param latitude
 * @type number
 * @text 緯度
 * @desc 緯度を代入する変数の番号を指定します。
 * @default 1
 *
 * @param longitude
 * @type number
 * @text 経度
 * @desc 経度を代入する変数の番号を指定します。
 * @default 2
 *
 * @param altitude
 * @type number
 * @text 高度
 * @desc 高度を代入する変数の番号を指定します。
 * @default 3
 *
 * @param accuracy
 * @type number
 * @text 精度
 * @desc 緯度・経度の精度を代入する変数の番号を指定します。
 * @default 4
 *
 * @param altitudeAccuracy
 * @type number
 * @text 高度精度
 * @desc 高度の精度を代入する変数の番号を指定します。
 * @default 5
 *
 * @param heading
 * @type number
 * @text 移動方向
 * @desc 移動方向（北：0、東：90、南：180、西：270）を代入する変数の番号を指定します。
 * @default 6
 *
 * @param speed
 * @type number
 * @text 移動スピード
 * @desc 移動スピードを代入する変数の番号を指定します。
 * @default 7
 *
 * @help
 *
 * ◆プラグインコマンド：GetGeolocation で位置情報を取得します。
 * 取得した位置情報は「パラメータ」で指定した番号の変数に代入されます。
 * 位置情報の取得に失敗した場合は、指定したすべての変数に０が代入されます。
 *
 * ※「並列処理」の中でプラグインコマンドを利用しますと
 *   その時セーブしたセーブデータの状態が不確定になりますので、
 *   可能な限り「並列処理」以外のトリガーでご利用ください。
 */

import { toTypedParameters } from "./utils/parameter";
import { addPluginCommand, prepareBindPromise } from "./utils/rmmvbridge";

declare const navigator: any;
const parameters = toTypedParameters(PluginManager.parameters("GetGeolocation"));
const getGeolocation = () => new Promise<any>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
const setGeolocation = (positionOrError: any) => {
    for (const key in parameters) {
        $gameVariables.setValue(parameters[key], positionOrError.coords ? positionOrError.coords[key] : 0);
    }
};

prepareBindPromise();

addPluginCommand({
    GetGeolocation,
    "位置情報取得": GetGeolocation
});

function GetGeolocation(this: Game_Interpreter) {
    this.bindPromiseForRPGAtsumaruPlugin(getGeolocation(), setGeolocation, setGeolocation);
}
