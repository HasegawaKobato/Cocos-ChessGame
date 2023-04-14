import { EventTarget } from "cc";

export enum EventType {
  CLICK_POSITION = "clickPosition",
  SHOW_VALIDPATH = "showValidPath",
  CANCEL_SELECT = "cancelSelect",
  KILLED = "killed",
  SELECT_PAWN_CHANGE = "selectPawnChange",
  GAME_OVER = "gameOver",
  TURN = "turn",
}

export default class Event {
  private static _event: EventTarget = null;
  public static get event() {
    const event = this._event || new EventTarget();
    this._event = event;
    return this._event;
  }
}
