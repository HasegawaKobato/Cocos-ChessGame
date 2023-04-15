import Event, { EventType } from "../Game/Event";

export enum RoleEnum {
  A,
  B,
}

export enum GameState {
  ATurn,
  AThinking,
  ARunning,
  BTurn,
  BThinking,
  BRunning,
  PwanChanging,
  GameOver
}

export default class GameModel {
  private static _gameState: GameState = GameState.ATurn;
  public static get gameState(): GameState {
    return this._gameState
  }
  public static set gameState(v: GameState) {
    this._gameState = v;
    Event.event.emit(EventType.GAMESTATE_CHANGE);
  }

  public static role: RoleEnum = RoleEnum.A;
  public static get enemyRole(): RoleEnum {
    return GameModel.role === RoleEnum.A ? RoleEnum.B : RoleEnum.A;
  }

  public static selectedRole: RoleEnum = RoleEnum.A;
  public static turnRole: RoleEnum = RoleEnum.A;
  /** ${from pos}-${to pos} */
  public static stepRecord: string[] = [];

  public static isEnemyCPU: boolean = true;
  public static isSelfCPU: boolean = true;

  public static isGameOver: boolean = false;
}
