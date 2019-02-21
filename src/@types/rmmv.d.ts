declare const PIXI: any;
declare const FPSMeter: any;
declare const makeVideoPlayableInline: any;
declare const LZString: any;

declare const Patch: any;
declare const ProgressWatcher: any;
declare const JsExtensions: any;
declare const Utils: any;
declare const CacheEntry: any;
declare const CacheMap: any;
declare const ImageCache: any;
declare const RequestQueue: any;
declare const Point: any;
declare const Rectangle: any;
declare const Bitmap: any;
declare const Graphics: {
    _showErrorDetail: boolean
    _formatEventInfo(error: unknown): string
    _formatEventCommandInfo(error: unknown): string
    _video: any
    _videoUnlocked: boolean
    _videoLoading: boolean
    initialize(width: unknown, height: unknown, type: unknown): void
    _onTouchEnd(event?: unknown): void
    _setupEventHandlers(): void
    _onVideoLoad(): void
    _updateVisibility(videoVisible: boolean): void
};
declare const Input: any;
declare const TouchInput: {
    _setupEventHandlers(): void
    clear(): void
};
declare const Sprite: any;
declare const Tilemap: any;
declare const ShaderTilemap: any;
declare const TilingSprite: any;
declare const ScreenSprite: any;
declare const Window: any;
declare const WindowLayer: any;
declare const Weather: any;
declare const ToneFilter: any;
declare const ToneSprite: any;
declare const Stage: any;
declare const WebAudio: {
    _context: any
    _onTouchStart(): void
    _setupEventHandlers(): void
};
declare const Html5Audio: any;
declare const JsonEx: any;
declare const Decrypter: any;
declare const ResourceHandler: any;

declare const DataManager: {
    saveGame(savefileId: number): boolean
    isDatabaseLoaded(): boolean
    createGameObjects(): void
    extractSaveContents(): void
};
declare const ConfigManager: any;
declare const StorageManager: any;
declare const ImageManager: any;
declare const AudioManager: any;
declare const SoundManager: any;
declare const TextManager: any;
declare const SceneManager: any;
declare const BattleManager: any;
declare const PluginManager: any;

declare class Game_Temp {
    _loadingCounterForRPGAtsumaruPlugin: number
    initialize(): void
}
declare const Game_System: any;
declare const Game_Timer: any;
declare const Game_Message: any;
declare const Game_Switches: any;
declare const Game_Variables: any;
declare const Game_SelfSwitches: any;
declare const Game_Screen: any;
declare const Game_Picture: any;
declare const Game_Item: any;
declare const Game_Action: any;
declare const Game_ActionResult: any;
declare const Game_BattlerBase: any;
declare const Game_Battler: any;
declare const Game_Actor: any;
declare const Game_Enemy: any;
declare const Game_Actors: any;
declare const Game_Unit: any;
declare const Game_Party: any;
declare const Game_Troop: any;
declare const Game_Map: any;
declare const Game_CommonEvent: any;
declare const Game_CharacterBase: any;
declare const Game_Character: any;
declare const Game_Player: any;
declare const Game_Follower: any;
declare const Game_Followers: any;
declare const Game_Vehicle: any;
declare const Game_Event: any;
declare class Game_Interpreter {
    _index: number
    _params: any[]
    _eventInfo: {[key: string]: any}
    _promiseResolverForRPGAtsumaruPlugin?: () => boolean
    bindPromiseForRPGAtsumaruPlugin<T>(promise: Promise<T>, resolve?: (value : T) => void, reject?: (error: AtsumaruApiError) => void): void
    executeCommand(): boolean
    pluginCommand(command: string, args: string[]): void
}

declare const Scene_Base: any;
declare const Scene_Boot: any;
declare const Scene_Title: any;
declare const Scene_Map: any;
declare const Scene_MenuBase: any;
declare const Scene_Menu: any;
declare const Scene_ItemBase: any;
declare const Scene_Item: any;
declare const Scene_Skill: any;
declare const Scene_Equip: any;
declare const Scene_Status: any;
declare const Scene_Options: any;
declare const Scene_File: any;
declare const Scene_Save: any;
declare const Scene_Load: any;
declare const Scene_GameEnd: any;
declare const Scene_Shop: any;
declare const Scene_Name: any;
declare const Scene_Debug: any;
declare const Scene_Battle: any;
declare const Scene_Gameover: any;

declare const Sprite_Base: any;
declare const Sprite_Button: any;
declare const Sprite_Character: any;
declare const Sprite_Battler: any;
declare const Sprite_Actor: any;
declare const Sprite_Enemy: any;
declare const Sprite_Animation: any;
declare const Sprite_Damage: any;
declare const Sprite_StateIcon: any;
declare const Sprite_StateOverlay: any;
declare const Sprite_Weapon: any;
declare const Sprite_Balloon: any;
declare const Sprite_Picture: any;
declare const Sprite_Timer: any;
declare const Sprite_Destination: any;
declare const Spriteset_Base: any;
declare const Spriteset_Map: any;
declare const Spriteset_Battle: any;

declare const Window_Base: any;
declare const Window_Selectable: any;
declare const Window_Command: any;
declare const Window_HorzCommand: any;
declare const Window_Help: any;
declare const Window_Gold: any;
declare const Window_MenuCommand: any;
declare const Window_MenuStatus: any;
declare const Window_MenuActor: any;
declare const Window_ItemCategory: any;
declare const Window_ItemList: any;
declare const Window_SkillType: any;
declare const Window_SkillStatus: any;
declare const Window_SkillList: any;
declare const Window_EquipStatus: any;
declare const Window_EquipCommand: any;
declare const Window_EquipSlot: any;
declare const Window_EquipItem: any;
declare const Window_Status: any;
declare const Window_Options: any;
declare const Window_SavefileList: any;
declare const Window_ShopCommand: any;
declare const Window_ShopBuy: any;
declare const Window_ShopSell: any;
declare const Window_ShopNumber: any;
declare const Window_ShopStatus: any;
declare const Window_NameEdit: any;
declare const Window_NameInput: any;
declare const Window_ChoiceList: any;
declare const Window_NumberInput: any;
declare const Window_EventItem: any;
declare const Window_Message: any;
declare const Window_ScrollText: any;
declare const Window_MapName: any;
declare const Window_BattleLog: any;
declare const Window_PartyCommand: any;
declare const Window_ActorCommand: any;
declare const Window_BattleStatus: any;
declare const Window_BattleActor: any;
declare const Window_BattleEnemy: any;
declare const Window_BattleSkill: any;
declare const Window_BattleItem: any;
declare const Window_TitleCommand: any;
declare const Window_GameEnd: any;
declare const Window_DebugRange: any;
declare const Window_DebugEdit: any;

declare const $dataActors: any;
declare const $dataClasses: any;
declare const $dataSkills: any;
declare const $dataItems: any;
declare const $dataWeapons: any;
declare const $dataArmors: any;
declare const $dataEnemies: any;
declare const $dataTroops: any;
declare const $dataStates: any;
declare const $dataAnimations: any;
declare const $dataTilesets: any;
declare const $dataCommonEvents: any;
declare const $dataSystem: any;
declare const $dataMapInfos: any;
declare const $dataMap: any;
declare const $gameTemp: Game_Temp;
declare const $gameSystem: any;
declare const $gameScreen: any;
declare const $gameTimer: any;
declare const $gameMessage: any;
declare const $gameSwitches: any;
declare const $gameVariables: any;
declare const $gameSelfSwitches: any;
declare const $gameActors: any;
declare const $gameParty: any;
declare const $gameTroop: any;
declare const $gameMap: any;
declare const $gamePlayer: any;
declare const $testEvent: any;
declare const $plugins: any;
