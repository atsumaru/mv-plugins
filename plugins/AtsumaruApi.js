//=============================================================================
// AtsumaruApi.js
//
// Copyright (c) 2018-2020 RPGアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @target MZ
 * @plugindesc RPGアツマールAPIを利用可能にするプラグインです
 * @author RPGアツマール開発チーム
 * @base WaitCommandUntilPromiseSettled
 * @url https://atsumaru.github.io/api-references/
 *
 * @help
 * RPGアツマール上に投稿したゲームで利用できる「RPGアツマールAPI」を
 * プラグインコマンド形式で利用可能にするプラグインです。
 *
 * プラグインコマンドの効果と使い方は各コマンド内で簡単に説明されていますが、
 * より詳細な仕様を知りたい場合はRPGアツマールAPIリファレンス（最上部URL）の
 * 各機能の解説ページをお読みください。
 *
 * ※RPGアツマール上でない場合、各コマンドはスキップされます。
 *
 * ※RPGアツマールのサーバーに負荷をかけないため、
 *   コマンドとコマンドの間隔はなるべく５秒以上空けてください。
 *
 * ※「*」で始まる引数は、実行結果がその変数に代入されることを意味しています。
 *   特に「*エラーメッセージ」には
 *     コマンド成功時  →  0
 *     コマンド失敗時  →  失敗の原因を示すエラーメッセージ
 *   が代入されます。
 *
 * ※各コマンドは「ログイン必須なのに非ログイン」「プレイヤー間通信が非有効」
 *   などの理由により失敗する可能性があります。
 *   コマンド実行後は、実行結果を扱う前にまずコマンドに成功している
 *   （＝エラーメッセージが0である）ことを確認してから結果を利用してください。
 *
 * @command isAtsumaru
 * @text アツマールかどうか判定
 * @desc RPGアツマール上でプレイしているかどうかを判定します。
 *
 * @arg isAtsumaru
 * @type switch
 * @text *判定結果
 * @desc RPGアツマール上でプレイしている場合、このスイッチがONになります。
 *
 * @command enableInterplayer
 * @text プレイヤー間通信の有効化
 * @desc 他のユーザーが、このユーザーの各種情報を読み取ることを許可します。一部コマンドの実行に必要です。
 *
 * @arg errorMessage
 * @type variable
 * @text *エラーメッセージ
 * @desc コマンド失敗時、この変数にエラーメッセージを代入します。（成功時は0を代入します）
 *
 * @command openLink
 * @text リンク表示
 * @desc アツマールのゲームから他のページへのリンクを表示します。
 *
 * @arg url
 * @type string
 * @text URL
 *
 * @arg comment
 * @type string
 * @text 説明文
 *
 * @command openCreatorInfo
 * @text 作者情報表示
 * @desc ユーザーIDを指定して、そのユーザーのプロフィールや投稿したゲームを表示します。
 *
 * @arg id
 * @type variable
 * @text ユーザーID
 * @desc この変数に代入されたユーザーIDを読み取り、その作者の情報を表示します。省略時は、このゲームの作者を表示します。
 *
 * @command openScreenshot
 * @text スクリーンショットを撮影
 * @desc ゲーム画面のスクリーンショットを撮影して、ツイートによるシェアを促します。
 *
 * @arg tweeted
 * @type switch
 * @text *ツイートしたか
 * @desc 実際にスクリーンショットをツイートしてシェアした場合、このスイッチがONになります。
 *
 * @command setTweetMessage
 * @text スクリーンショットのツイート内容を変更
 * @desc スクリーンショットのツイート画面で、ツイート内容の初期設定値を変更します。
 *
 * @arg tweetText
 * @type variable
 * @text ツイート文言
 * @desc ツイート内容のメッセージ部分を変更します。省略時は、初期文に戻ります。
 *
 * @arg param1
 * @type variable
 * @desc ツイート内容のURLクエリ部分を変更します。省略時は、クエリなしになります。
 *
 * @arg param2
 * @type variable
 * @desc ツイート内容のURLクエリ部分を変更します。省略時は、クエリなしになります。
 *
 * @arg param3
 * @type variable
 * @desc ツイート内容のURLクエリ部分を変更します。省略時は、クエリなしになります。
 *
 * @arg param4
 * @type variable
 * @desc ツイート内容のURLクエリ部分を変更します。省略時は、クエリなしになります。
 *
 * @arg param5
 * @type variable
 * @desc ツイート内容のURLクエリ部分を変更します。省略時は、クエリなしになります。
 *
 * @arg param6
 * @type variable
 * @desc ツイート内容のURLクエリ部分を変更します。省略時は、クエリなしになります。
 *
 * @arg param7
 * @type variable
 * @desc ツイート内容のURLクエリ部分を変更します。省略時は、クエリなしになります。
 *
 * @arg param8
 * @type variable
 * @desc ツイート内容のURLクエリ部分を変更します。省略時は、クエリなしになります。
 *
 * @arg param9
 * @type variable
 * @desc ツイート内容のURLクエリ部分を変更します。省略時は、クエリなしになります。
 *
 * @command getQuery
 * @text クエリ取得
 * @desc ゲームのURL末尾に記述されたクエリの内容を取得します。
 *
 * @arg param1
 * @type variable
 * @desc コマンド成功時、この変数にクエリを代入します。
 *
 * @arg param2
 * @type variable
 * @desc コマンド成功時、この変数にクエリを代入します。
 *
 * @arg param3
 * @type variable
 * @desc コマンド成功時、この変数にクエリを代入します。
 *
 * @arg param4
 * @type variable
 * @desc コマンド成功時、この変数にクエリを代入します。
 *
 * @arg param5
 * @type variable
 * @desc コマンド成功時、この変数にクエリを代入します。
 *
 * @arg param6
 * @type variable
 * @desc コマンド成功時、この変数にクエリを代入します。
 *
 * @arg param7
 * @type variable
 * @desc コマンド成功時、この変数にクエリを代入します。
 *
 * @arg param8
 * @type variable
 * @desc コマンド成功時、この変数にクエリを代入します。
 *
 * @arg param9
 * @type variable
 * @desc コマンド成功時、この変数にクエリを代入します。
 *
 * @command getUserInfo
 * @text ユーザー情報取得
 * @desc ユーザーIDを指定して、そのユーザーの情報を取得します。
 *
 * @arg id
 * @type variable
 * @text ユーザーID
 * @desc この変数に代入されたユーザーIDを読み取り、そのユーザーの情報を取得します。
 *
 * @arg name
 * @type variable
 * @text *ユーザー名
 * @desc コマンド成功時、この変数にユーザー名を代入します。
 *
 * @arg profile
 * @type variable
 * @text *自己紹介
 * @desc コマンド成功時、この変数にユーザーの自己紹介を代入します。
 *
 * @arg twitterId
 * @type variable
 * @text *TwitterID
 * @desc コマンド成功時、この変数にユーザーのTwitterIDを代入します。
 *
 * @arg url
 * @type variable
 * @text *ウェブサイト
 * @desc コマンド成功時、この変数にユーザーのウェブサイトを代入します。
 *
 * @arg errorMessage
 * @type variable
 * @text *エラーメッセージ
 * @desc コマンド失敗時、この変数にエラーメッセージを代入します。（成功時は0を代入します）
 *
 * @command getSelfInfo
 * @text 自己情報取得
 * @desc ゲームをプレイしているユーザー本人の情報を取得します。
 *
 * @arg id
 * @type variable
 * @text *ユーザーID
 * @desc コマンド成功時、この変数にユーザーIDを代入します。
 *
 * @arg name
 * @type variable
 * @text *ユーザー名
 * @desc コマンド成功時、この変数にユーザー名を代入します。
 *
 * @arg profile
 * @type variable
 * @text *自己紹介
 * @desc コマンド成功時、この変数にユーザーの自己紹介を代入します。
 *
 * @arg twitterId
 * @type variable
 * @text *TwitterID
 * @desc コマンド成功時、この変数にユーザーのTwitterIDを代入します。
 *
 * @arg url
 * @type variable
 * @text *ウェブサイト
 * @desc コマンド成功時、この変数にユーザーのウェブサイトを代入します。
 *
 * @arg isPremium
 * @type switch
 * @text *プレミアム会員か
 * @desc コマンド成功時、プレミアム会員ならこのスイッチがONになります。
 *
 * @arg errorMessage
 * @type variable
 * @text *エラーメッセージ
 * @desc コマンド失敗時、この変数にエラーメッセージを代入します。（成功時は0を代入します）
 *
 * @command getRecentUsers
 * @text 最新ユーザー取得
 * @desc 最近このゲームを遊んだプレイヤーを、最新順に最大100人まで取得します。
 *
 * @arg count
 * @type variable
 * @text *取得できた人数
 * @desc コマンド成功時、この変数に最新ユーザーを何人取得できたかを代入します。
 *
 * @arg id
 * @type variable
 * @text *ユーザーID(先頭)
 * @desc コマンド成功時、この変数を先頭にユーザーIDを代入します。例:201を指定すると変数201番～300番に代入
 *
 * @arg name
 * @type variable
 * @text *ユーザー名(先頭)
 * @desc コマンド成功時、この変数を先頭にユーザー名を代入します。例:201を指定すると変数201番～300番に代入
 *
 * @arg errorMessage
 * @type variable
 * @text *エラーメッセージ
 * @desc コマンド失敗時、この変数にエラーメッセージを代入します。（成功時は0を代入します）
 *
 * @command getActiveUserCount
 * @text オンライン人数取得
 * @desc 今から直近oo分までの間にこのゲームを遊んだログインプレイヤーの人数を取得します。
 *
 * @arg minutes
 * @type number
 * @text 直近何分
 * @desc 今から直近何分までを、人数の集計対象とするかを指定します。
 *
 * @arg count
 * @type variable
 * @text *集計結果
 * @desc コマンド成功時、この変数にオンライン人数を代入します。
 *
 * @arg errorMessage
 * @type variable
 * @text *エラーメッセージ
 * @desc コマンド失敗時、この変数にエラーメッセージを代入します。（成功時は0を代入します）
 *
 * @command sendScoreboard
 * @text スコア送信
 * @desc ゲームのスコアをアツマールサーバーに送信し、このプレイヤーのスコアとして登録します。
 *
 * @arg boardId
 * @type number
 * @min 1
 * @max 30
 * @default 1
 * @text スコアボードID
 * @desc スコアボードのID(番号)を指定します。
 *
 * @arg score
 * @type variable
 * @text スコア
 * @desc この変数からスコアを読み取り、送信します。
 *
 * @arg errorMessage
 * @type variable
 * @text *エラーメッセージ
 * @desc コマンド失敗時、この変数にエラーメッセージを代入します。（成功時は0を代入します）
 *
 * @command openScoreboard
 * @text スコア表示
 * @desc ゲームのスコアをアツマールサーバーから受信し、ランキング表示します。
 *
 * @arg boardId
 * @type number
 * @min 1
 * @max 30
 * @default 1
 * @text スコアボードID
 * @desc スコアボードのID(番号)を指定します。
 *
 * @command getScoreboard
 * @text スコア取得
 * @desc ゲームのスコアランキングを、1位から順に最大100位まで取得して変数に代入します。
 *
 * @arg boardId
 * @type number
 * @min 1
 * @max 30
 * @default 1
 * @text スコアボードID
 * @desc スコアボードのID(番号)を指定します。
 *
 * @arg count
 * @type variable
 * @text *取得できた件数
 * @desc コマンド成功時、この変数にランキングを何件取得できたかを代入します。
 *
 * @arg score
 * @type variable
 * @text *スコア(先頭)
 * @desc コマンド成功時、この変数を先頭にスコアを代入します。例:201を指定すると変数201番～300番に代入
 *
 * @arg rank
 * @type variable
 * @text *順位(先頭)
 * @desc コマンド成功時、この変数を先頭に順位を代入します。例:201を指定すると変数201番～300番に代入
 *
 * @arg id
 * @type variable
 * @text *ユーザーID(先頭)
 * @desc コマンド成功時、この変数を先頭にシグナル送信者のユーザーIDを代入します。例:201を指定すると変数201番～300番に代入
 *
 * @arg name
 * @type variable
 * @text *ユーザー名(先頭)
 * @desc コマンド成功時、この変数を先頭にシグナル送信者のユーザー名を代入します。例:201を指定すると変数201番～300番に代入
 *
 * @arg errorMessage
 * @type variable
 * @text *エラーメッセージ
 * @desc コマンド失敗時、この変数にエラーメッセージを代入します。（成功時は0を代入します）
 *
 * @command getGlobalServerVariables
 * @text グローバルサーバー変数取得
 * @desc グローバルサーバー変数の値を取得し、ツクールの変数に代入します。
 *
 * @arg globalServerVariables
 * @type struct<globalServerVariable>[]
 * @text GS変数リスト
 * @desc 取得したいグローバルサーバー変数の名前と、それをどのツクール変数に代入するかを指定します。（複数可）
 *
 * @arg errorMessage
 * @type variable
 * @text *エラーメッセージ
 * @desc コマンド失敗時、この変数にエラーメッセージを代入します。（成功時は0を代入します）
 *
 * @command callTrigger
 * @text グローバルサーバー変数のトリガー発動
 * @desc グローバルサーバー変数のトリガーを発動して、GS変数の値を変更します。
 *
 * @arg globalServerVariableName
 * @type string
 * @text GS変数名
 * @desc 変更を加えるグローバルサーバー変数の名前を指定します。
 *
 * @arg triggerName
 * @type string
 * @text トリガー名
 * @desc 発動するトリガーの名前を指定します。
 *
 * @arg value
 * @type variable
 * @desc この変数に代入された値を読み取り、増減トリガーの場合は増減値・代入トリガーの場合は代入値とします。
 *
 * @arg errorMessage
 * @type variable
 * @text *エラーメッセージ
 * @desc コマンド失敗時、この変数にエラーメッセージを代入します。（成功時は0を代入します）
 *
 * @command setSharedSave
 * @text 共有セーブ保存
 * @desc 指定した範囲の変数を、共有セーブとして保存します。通常のセーブと違い、他人からも読み取り可能です。
 *
 * @arg startVariableId
 * @type variable
 * @text 保存範囲(開始)
 * @desc この変数から、終了範囲までを共有セーブとして保存します。
 *
 * @arg finishVariableId
 * @type variable
 * @text 保存範囲(終了)
 * @desc 開始範囲から、この変数までを共有セーブとして保存します。
 *
 * @arg errorMessage
 * @type variable
 * @text *エラーメッセージ
 * @desc コマンド失敗時、この変数にエラーメッセージを代入します。（成功時は0を代入します）
 *
 * @command getSharedSave
 * @text 共有セーブ取得
 * @desc 共有セーブを取得し、ツクールの変数に代入します。通常のセーブと違い、他人のデータも読み取り可能です。
 *
 * @arg sharedSaves
 * @type struct<sharedSave>[]
 * @text 共有セーブ取得対象リスト
 * @desc 取得したいユーザーと、それをどの変数に代入するかを指定します。（最大100人まで）
 *
 * @arg gameId
 * @type number
 * @text ゲームID
 * @desc 同作者の他のゲームから共有セーブを取得する場合は、ここにゲームID(gmXXX)をgm抜きで指定します。
 *
 * @arg errorMessage
 * @type variable
 * @text *エラーメッセージ
 * @desc コマンド失敗時、この変数にエラーメッセージを代入します。（成功時は0を代入します）
 *
 * @command sendGlobalSignal
 * @text グローバルシグナル送信
 * @desc 指定した変数の内容を、グローバルシグナルとして送信します。GS変数と違い、シグナルは最大約1000件蓄積されます。
 *
 * @arg data
 * @type variable
 * @text シグナルデータ
 * @desc この変数に代入された値を読み取り、グローバルシグナルとして送信します。
 *
 * @arg errorMessage
 * @type variable
 * @text *エラーメッセージ
 * @desc コマンド失敗時、この変数にエラーメッセージを代入します。（成功時は0を代入します）
 *
 * @command getGlobalSignals
 * @text グローバルシグナル受信
 * @desc このゲームに送られたグローバルシグナルを、最新順に最大約1000件まで取得します。
 *
 * @arg count
 * @type variable
 * @text *取得できた件数
 * @desc コマンド成功時、この変数にシグナルを何件取得できたかを代入します。
 *
 * @arg data
 * @type variable
 * @text *シグナルデータ(先頭)
 * @desc コマンド成功時、この変数を先頭にシグナルデータを代入します。例:201を指定すると変数201番～1200番に代入
 *
 * @arg id
 * @type variable
 * @text *ユーザーID(先頭)
 * @desc コマンド成功時、この変数を先頭にシグナル送信者のユーザーIDを代入します。例:201を指定すると変数201番～1200番に代入
 *
 * @arg name
 * @type variable
 * @text *ユーザー名(先頭)
 * @desc コマンド成功時、この変数を先頭にシグナル送信者のユーザー名を代入します。例:201を指定すると変数201番～1200番に代入
 *
 * @arg createdAt
 * @type variable
 * @text *送信時刻(先頭)
 * @desc コマンド成功時、この変数を先頭にシグナルの送信時刻を代入します。時刻は1970年1月1日午前9時からの経過秒数で表されます
 *
 * @arg errorMessage
 * @type variable
 * @text *エラーメッセージ
 * @desc コマンド失敗時、この変数にエラーメッセージを代入します。（成功時は0を代入します）
 *
 * @command sendUserSignal
 * @text ユーザーシグナル送信
 * @desc 指定した変数の内容を、ユーザーシグナルとして送信します。ユーザーシグナルは特定のユーザーへ送信され蓄積されます。
 *
 * @arg id
 * @type variable
 * @text 送信先ユーザーID
 * @desc この変数に代入されたユーザーIDを読み取り、そのユーザーへユーザーシグナルを送信します。
 *
 * @arg data
 * @type variable
 * @text シグナルデータ
 * @desc この変数に代入された値を読み取り、ユーザーシグナルとして送信します。
 *
 * @arg errorMessage
 * @type variable
 * @text *エラーメッセージ
 * @desc コマンド失敗時、この変数にエラーメッセージを代入します。（成功時は0を代入します）
 *
 * @command getUserSignals
 * @text ユーザーシグナル受信
 * @desc このユーザーに送られたユーザーシグナルを、最新順に最大約数百件まで取得します。
 *
 * @arg count
 * @type variable
 * @text *取得できた件数
 * @desc コマンド成功時、この変数にシグナルを何件取得できたかを代入します。
 *
 * @arg data
 * @type variable
 * @text *シグナルデータ(先頭)
 * @desc コマンド成功時、この変数を先頭にシグナルデータを代入します。例:201を指定すると変数201番～1200番に代入
 *
 * @arg id
 * @type variable
 * @text *ユーザーID(先頭)
 * @desc コマンド成功時、この変数を先頭にシグナル送信者のユーザーIDを代入します。例:201を指定すると変数201番～1200番に代入
 *
 * @arg name
 * @type variable
 * @text *ユーザー名(先頭)
 * @desc コマンド成功時、この変数を先頭にシグナル送信者のユーザー名を代入します。例:201を指定すると変数201番～1200番に代入
 *
 * @arg createdAt
 * @type variable
 * @text *送信時刻(先頭)
 * @desc コマンド成功時、この変数を先頭にシグナルの送信時刻を代入します。時刻は1970年1月1日午前9時からの経過秒数で表されます
 *
 * @arg errorMessage
 * @type variable
 * @text *エラーメッセージ
 * @desc コマンド失敗時、この変数にエラーメッセージを代入します。（成功時は0を代入します）
 *
 * @command getNicoadPoints
 * @text ニコニ広告ポイント取得
 * @desc このゲームに対して、合計何ポイント広告されたかを取得します。
 *
 * @arg activePoint
 * @type variable
 * @text *アクティブポイント
 * @desc コマンド成功時、この変数に広告期間内の広告の合計ポイントを代入します。
 *
 * @arg totalPoint
 * @type variable
 * @text *トータルポイント
 * @desc コマンド成功時、この変数にすべての広告の合計ポイントを代入します。
 *
 * @arg errorMessage
 * @type variable
 * @text *エラーメッセージ
 * @desc コマンド失敗時、この変数にエラーメッセージを代入します。（成功時は0を代入します）
 *
 * @command getNicoadHistories
 * @text ニコニ広告履歴取得
 * @desc このゲームに対してのニコニ広告の履歴を、最新順に最大30件まで取得します。
 *
 * @arg count
 * @type variable
 * @text *取得できた件数
 * @desc コマンド成功時、この変数に広告を何件取得できたかを代入します。
 *
 * @arg name
 * @type variable
 * @text *広告者名(先頭)
 * @desc コマンド成功時、この変数を先頭に広告者名を代入します。例:201を指定すると変数201番～230番に代入
 *
 * @arg point
 * @type variable
 * @text *広告ポイント(先頭)
 * @desc コマンド成功時、この変数を先頭に広告ポイントを代入します。例:201を指定すると変数201番～230番に代入
 *
 * @arg contribution
 * @type variable
 * @text *貢献度(先頭)
 * @desc コマンド成功時、この変数を先頭にこの広告による貢献度を代入します。例:201を指定すると変数201番～230番に代入
 *
 * @arg errorMessage
 * @type variable
 * @text *エラーメッセージ
 * @desc コマンド失敗時、この変数にエラーメッセージを代入します。（成功時は0を代入します）
 *
 * @command getNicoadRanking
 * @text ニコニ広告ランキング取得
 * @desc このゲームに対してのニコニ広告の貢献度ランキングを、1位から順に最大30位まで取得します。
 *
 * @arg count
 * @type variable
 * @text *取得できた件数
 * @desc コマンド成功時、この変数に広告を何件取得できたかを代入します。
 *
 * @arg name
 * @type variable
 * @text *広告者名(先頭)
 * @desc コマンド成功時、この変数を先頭に広告者名を代入します。例:201を指定すると変数201番～230番に代入
 *
 * @arg rank
 * @type variable
 * @text *順位(先頭)
 * @desc コマンド成功時、この変数を先頭に順位を代入します。例:201を指定すると変数201番～230番に代入
 *
 * @arg contribution
 * @type variable
 * @text *貢献度(先頭)
 * @desc コマンド成功時、この変数を先頭にこのユーザーの累計貢献度を代入します。例:201を指定すると変数201番～230番に代入
 *
 * @arg errorMessage
 * @type variable
 * @text *エラーメッセージ
 * @desc コマンド失敗時、この変数にエラーメッセージを代入します。（成功時は0を代入します）
 */

/*~struct~globalServerVariable:
 * @param name
 * @type string
 * @text GS変数名
 * @desc 取得したいグローバルサーバー変数の名前を指定します。
 *
 * @param variableId
 * @type variable
 * @text *代入先変数
 * @desc コマンド成功時、この変数にグローバルサーバー変数の値を代入します。
 */

/*~struct~sharedSave:
 * @param id
 * @type variable
 * @text ユーザーID
 * @desc この変数に代入されたユーザーIDを読み取り、そのユーザーの共有セーブを取得します。
 *
 * @param variableId
 * @type variable
 * @text *代入先変数(先頭)
 * @desc コマンド成功時、この変数を先頭に共有セーブを代入します。例:保存範囲が5個のとき、3を指定すると変数3番～7番に代入
 */

PluginManager.registerCommand("AtsumaruApi", "isAtsumaru", function({ isAtsumaru }) {
    $gameSwitches.setValue(isAtsumaru, !!window.RPGAtsumaru);
});

PluginManager.registerCommand("AtsumaruApi", "enableInterplayer", function({ errorMessage }) {
    if (window.RPGAtsumaru) {
        this.waitUntilPromiseSettled(window.RPGAtsumaru.interplayer.enable(),
            () => $gameVariables.setValue(errorMessage, 0),
            error => $gameVariables.setValue(errorMessage, error.message)
        );
    }
});

PluginManager.registerCommand("AtsumaruApi", "openLink", function({ url, comment }) {
    if (window.RPGAtsumaru) {
        this.waitUntilPromiseSettled(window.RPGAtsumaru.popups.openLink(url, comment));
    }
});

PluginManager.registerCommand("AtsumaruApi", "openCreatorInfo", function({ id }) {
    if (window.RPGAtsumaru) {
        this.waitUntilPromiseSettled(window.RPGAtsumaru.popups.displayCreatorInformationModal($gameVariables.value(id) || undefined));
    }
});

PluginManager.registerCommand("AtsumaruApi", "openScreenshot", function({ tweeted }) {
    if (window.RPGAtsumaru) {
        this.waitUntilPromiseSettled(window.RPGAtsumaru.screenshot.displayModal(), result => $gameSwitches.setValue(tweeted, result.tweeted));
    }
});

PluginManager.registerCommand("AtsumaruApi", "setTweetMessage", function(params) {
    if (window.RPGAtsumaru) {
        let tweetSettings = {};
        for (const key in params) {
            const variableId = params[key];
            const value = $gameVariables.value(variableId);
            if (value) {
                tweetSettings[key] = String(value);
            }
        }
        window.RPGAtsumaru.screenshot.setTweetMessage(tweetSettings);
    }
});

PluginManager.registerCommand("AtsumaruApi", "getQuery", function(params) {
    if (window.RPGAtsumaru) {
        for (const key in params) {
            const variableId = params[key];
            const query = window.RPGAtsumaru.query[key];
            $gameVariables.setValue(variableId, isNaN(+query) ? query : +query);
        }
    }
});

PluginManager.registerCommand("AtsumaruApi", "getUserInfo", function({ id, name, profile, twitterId, url, errorMessage }) {
    if (window.RPGAtsumaru) {
        this.waitUntilPromiseSettled(window.RPGAtsumaru.user.getUserInformation($gameVariables.value(id)),
            userInformation => {
                $gameVariables.setValue(name, userInformation.name);
                $gameVariables.setValue(profile, userInformation.profile);
                $gameVariables.setValue(twitterId, userInformation.twitterId);
                $gameVariables.setValue(url, userInformation.url);
                $gameVariables.setValue(errorMessage, 0);
            },
            error => $gameVariables.setValue(errorMessage, error.message)
        );
    }
});

PluginManager.registerCommand("AtsumaruApi", "getSelfInfo", function({ id, name, profile, twitterId, url, isPremium, errorMessage }) {
    if (window.RPGAtsumaru) {
        this.waitUntilPromiseSettled(window.RPGAtsumaru.user.getSelfInformation(),
            selfInformation => {
                $gameVariables.setValue(id, selfInformation.id);
                $gameVariables.setValue(name, selfInformation.name);
                $gameVariables.setValue(profile, selfInformation.profile);
                $gameVariables.setValue(twitterId, selfInformation.twitterId);
                $gameVariables.setValue(url, selfInformation.url);
                $gameSwitches.setValue(isPremium, selfInformation.isPremium);
                $gameVariables.setValue(errorMessage, 0);
            },
            error => $gameVariables.setValue(errorMessage, error.message)
        );
    }
});

PluginManager.registerCommand("AtsumaruApi", "getRecentUsers", function({ count, id, name, errorMessage }) {
    if (window.RPGAtsumaru) {
        this.waitUntilPromiseSettled(window.RPGAtsumaru.user.getRecentUsers(),
            recentUsers => {
                $gameVariables.setValue(count, recentUsers.length);
                id = +id;
                if (id) {
                    for (let i = 0; i < recentUsers.length; i++) {
                        $gameVariables.setValue(id + i, recentUsers[i].id);
                    }
                }
                name = +name;
                if (name) {
                    for (let i = 0; i < recentUsers.length; i++) {
                        $gameVariables.setValue(name + i, recentUsers[i].name);
                    }
                }
                $gameVariables.setValue(errorMessage, 0);
            },
            error => $gameVariables.setValue(errorMessage, error.message)
        );
    }
});

PluginManager.registerCommand("AtsumaruApi", "getActiveUserCount", function({ minutes, count, errorMessage }) {
    if (window.RPGAtsumaru) {
        this.waitUntilPromiseSettled(window.RPGAtsumaru.user.getActiveUserCount(+minutes),
            result => {
                $gameVariables.setValue(count, result);
                $gameVariables.setValue(errorMessage, 0);
            },
            error => $gameVariables.setValue(errorMessage, error.message)
        );
    }
});

PluginManager.registerCommand("AtsumaruApi", "sendScoreboard", function({ boardId, score, errorMessage }) {
    if (window.RPGAtsumaru) {
        this.waitUntilPromiseSettled(window.RPGAtsumaru.scoreboards.setRecord(+boardId, $gameVariables.value(score)),
            () => $gameVariables.setValue(errorMessage, 0),
            error => $gameVariables.setValue(errorMessage, error.message)
        );
    }
});

PluginManager.registerCommand("AtsumaruApi", "openScoreboard", function({ boardId }) {
    if (window.RPGAtsumaru) {
        this.waitUntilPromiseSettled(window.RPGAtsumaru.scoreboards.display(+boardId));
    }
});

PluginManager.registerCommand("AtsumaruApi", "getScoreboard", function({ boardId, count, score, rank, id, name, errorMessage }) {
    if (window.RPGAtsumaru) {
        this.waitUntilPromiseSettled(window.RPGAtsumaru.scoreboards.getRecords(+boardId),
            ({ ranking }) => {
                $gameVariables.setValue(count, ranking.length);
                score = +score;
                if (score) {
                    for (let i = 0; i < ranking.length; i++) {
                        $gameVariables.setValue(score + i, ranking[i].score);
                    }
                }
                rank = +rank;
                if (rank) {
                    for (let i = 0; i < ranking.length; i++) {
                        $gameVariables.setValue(rank + i, ranking[i].rank);
                    }
                }
                id = +id;
                if (id) {
                    for (let i = 0; i < ranking.length; i++) {
                        $gameVariables.setValue(id + i, ranking[i].userId);
                    }
                }
                name = +name;
                if (name) {
                    for (let i = 0; i < ranking.length; i++) {
                        $gameVariables.setValue(name + i, ranking[i].userName);
                    }
                }
                $gameVariables.setValue(errorMessage, 0);
            },
            error => $gameVariables.setValue(errorMessage, error.message)
        );
    }
});

PluginManager.registerCommand("AtsumaruApi", "getGlobalServerVariables", function({ globalServerVariables, errorMessage }) {
    if (window.RPGAtsumaru) {
        this.waitUntilPromiseSettled(window.RPGAtsumaru.globalServerVariable.getAllGlobalServerVariables(),
            result => {
                let message = "";
                const variableMap = {};
                result.forEach(variable => variableMap[variable.name] = variable.value);
                JSON.parse(globalServerVariables).forEach(variable => {
                    variable = JSON.parse(variable);
                    if (variable.name in variableMap) {
                        $gameVariables.setValue(variable.variableId, variableMap[variable.name]);
                    } else {
                        message = `指定された名前 '${variable.name}' のグローバルサーバー変数は存在しません`;
                    }
                });
                $gameVariables.setValue(errorMessage, message);
            },
            error => $gameVariables.setValue(errorMessage, error.message)
        );
    }
});

PluginManager.registerCommand("AtsumaruApi", "callTrigger", function({ globalServerVariableName, triggerName, value, errorMessage }) {
    if (window.RPGAtsumaru) {
        value = +value ? $gameVariables.value(value) : undefined;
        this.waitUntilPromiseSettled(window.RPGAtsumaru.globalServerVariable.triggerCallByName(globalServerVariableName, triggerName, value),
            () => $gameVariables.setValue(errorMessage, 0),
            error => $gameVariables.setValue(errorMessage, error.message)
        );
    }
});

PluginManager.registerCommand("AtsumaruApi", "setSharedSave", function({ startVariableId, finishVariableId, errorMessage }) {
    if (window.RPGAtsumaru) {
        const variables = [];
        for (let i = +startVariableId; i <= +finishVariableId; i++) {
            variables.push($gameVariables.value(i));
        }
        const value = JSON.stringify(variables);
        this.waitUntilPromiseSettled(window.RPGAtsumaru.storage.setItems([{ key: "Atsumaru Shared", value }]),
            () => $gameVariables.setValue(errorMessage, 0),
            error => $gameVariables.setValue(errorMessage, error.message)
        );
    }
});

PluginManager.registerCommand("AtsumaruApi", "getSharedSave", function({ sharedSaves, gameId, errorMessage }) {
    if (window.RPGAtsumaru) {
        sharedSaves = JSON.parse(sharedSaves).map(save => JSON.parse(save));
        sharedSaves.forEach(save => save.id = $gameVariables.value(save.id));
        this.waitUntilPromiseSettled(window.RPGAtsumaru.storage.getSharedItems(sharedSaves.map(save => save.id), +gameId || undefined),
            result => {
                let message = "";
                sharedSaves.forEach(save => {
                    if (+save.variableId) {
                        if (result[save.id]) {
                            const data = JSON.parse(result[save.id]);
                            for (let i = 0; i < data.length; i++) {
                                $gameVariables.setValue(+save.variableId + i, data[i]);
                            }
                        } else {
                            message = `指定されたユーザー '${save.id}' の共有セーブは存在しません`;
                        }
                    }
                });
                $gameVariables.setValue(errorMessage, message);
            },
            error => $gameVariables.setValue(errorMessage, error.message)
        );
    }
});

PluginManager.registerCommand("AtsumaruApi", "sendGlobalSignal", function({ data, errorMessage }) {
    if (window.RPGAtsumaru) {
        this.waitUntilPromiseSettled(window.RPGAtsumaru.signal.sendSignalToGlobal(String($gameVariables.value(data))),
            () => $gameVariables.setValue(errorMessage, 0),
            error => $gameVariables.setValue(errorMessage, error.message)
        );
    }
});

PluginManager.registerCommand("AtsumaruApi", "getGlobalSignals", function({ count, data, id, name, createdAt, errorMessage }) {
    if (window.RPGAtsumaru) {
        this.waitUntilPromiseSettled(window.RPGAtsumaru.signal.getGlobalSignals(),
            globalSignals => {
                $gameVariables.setValue(count, globalSignals.length);
                data = +data;
                if (data) {
                    for (let i = 0; i < globalSignals.length; i++) {
                        $gameVariables.setValue(data + i, isNaN(+globalSignals[i].data) ? globalSignals[i].data : +globalSignals[i].data);
                    }
                }
                id = +id;
                if (id) {
                    for (let i = 0; i < globalSignals.length; i++) {
                        $gameVariables.setValue(id + i, globalSignals[i].senderId);
                    }
                }
                name = +name;
                if (name) {
                    for (let i = 0; i < globalSignals.length; i++) {
                        $gameVariables.setValue(name + i, globalSignals[i].senderName);
                    }
                }
                createdAt = +createdAt;
                if (createdAt) {
                    for (let i = 0; i < globalSignals.length; i++) {
                        $gameVariables.setValue(createdAt + i, globalSignals[i].createdAt);
                    }
                }
                $gameVariables.setValue(errorMessage, 0);
            },
            error => $gameVariables.setValue(errorMessage, error.message)
        );
    }
});

PluginManager.registerCommand("AtsumaruApi", "sendUserSignal", function({ id, data, errorMessage }) {
    if (window.RPGAtsumaru) {
        this.waitUntilPromiseSettled(window.RPGAtsumaru.signal.sendSignalToUser($gameVariables.value(id), String($gameVariables.value(data))),
            () => $gameVariables.setValue(errorMessage, 0),
            error => $gameVariables.setValue(errorMessage, error.message)
        );
    }
});

PluginManager.registerCommand("AtsumaruApi", "getUserSignals", function({ count, data, id, name, createdAt, errorMessage }) {
    if (window.RPGAtsumaru) {
        this.waitUntilPromiseSettled(window.RPGAtsumaru.signal.getUserSignals(),
            userSignals => {
                $gameVariables.setValue(count, userSignals.length);
                data = +data;
                if (data) {
                    for (let i = 0; i < userSignals.length; i++) {
                        $gameVariables.setValue(data + i, isNaN(+userSignals[i].data) ? userSignals[i].data : +userSignals[i].data);
                    }
                }
                id = +id;
                if (id) {
                    for (let i = 0; i < userSignals.length; i++) {
                        $gameVariables.setValue(id + i, userSignals[i].senderId);
                    }
                }
                name = +name;
                if (name) {
                    for (let i = 0; i < userSignals.length; i++) {
                        $gameVariables.setValue(name + i, userSignals[i].senderName);
                    }
                }
                createdAt = +createdAt;
                if (createdAt) {
                    for (let i = 0; i < userSignals.length; i++) {
                        $gameVariables.setValue(createdAt + i, userSignals[i].createdAt);
                    }
                }
                $gameVariables.setValue(errorMessage, 0);
            },
            error => $gameVariables.setValue(errorMessage, error.message)
        );
    }
});

PluginManager.registerCommand("AtsumaruApi", "getNicoadPoints", function({ activePoint, totalPoint, errorMessage }) {
    if (window.RPGAtsumaru) {
        this.waitUntilPromiseSettled(window.RPGAtsumaru.nicoad.getPoints(),
            points => {
                $gameVariables.setValue(activePoint, points.activePoint);
                $gameVariables.setValue(totalPoint, points.totalPoint);
                $gameVariables.setValue(errorMessage, 0);
            },
            error => $gameVariables.setValue(errorMessage, error.message)
        );
    }
});

PluginManager.registerCommand("AtsumaruApi", "getNicoadHistories", function({ count, name, point, contribution, errorMessage }) {
    if (window.RPGAtsumaru) {
        this.waitUntilPromiseSettled(window.RPGAtsumaru.nicoad.getHistories(),
            ({ histories }) => {
                $gameVariables.setValue(count, histories.length);
                name = +name;
                if (name) {
                    for (let i = 0; i < histories.length; i++) {
                        $gameVariables.setValue(name + i, histories[i].advertiserName);
                    }
                }
                point = +point;
                if (point) {
                    for (let i = 0; i < histories.length; i++) {
                        $gameVariables.setValue(point + i, histories[i].adPoint);
                    }
                }
                contribution = +contribution;
                if (contribution) {
                    for (let i = 0; i < histories.length; i++) {
                        $gameVariables.setValue(contribution + i, histories[i].contribution);
                    }
                }
                $gameVariables.setValue(errorMessage, 0);
            },
            error => $gameVariables.setValue(errorMessage, error.message)
        );
    }
});

PluginManager.registerCommand("AtsumaruApi", "getNicoadRanking", function({ count, name, rank, contribution, errorMessage }) {
    if (window.RPGAtsumaru) {
        this.waitUntilPromiseSettled(window.RPGAtsumaru.nicoad.getRanking(),
            ranking => {
                $gameVariables.setValue(count, ranking.length);
                name = +name;
                if (name) {
                    for (let i = 0; i < ranking.length; i++) {
                        $gameVariables.setValue(name + i, ranking[i].advertiserName);
                    }
                }
                rank = +rank;
                if (rank) {
                    for (let i = 0; i < ranking.length; i++) {
                        $gameVariables.setValue(rank + i, ranking[i].rank);
                    }
                }
                contribution = +contribution;
                if (contribution) {
                    for (let i = 0; i < ranking.length; i++) {
                        $gameVariables.setValue(contribution + i, ranking[i].totalContribution);
                    }
                }
                $gameVariables.setValue(errorMessage, 0);
            },
            error => $gameVariables.setValue(errorMessage, error.message)
        );
    }
});
