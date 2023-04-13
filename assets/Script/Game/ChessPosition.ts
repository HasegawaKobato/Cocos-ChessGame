import { _decorator, Component, Node } from "cc";
import Event, { EventType } from "./Event";
import { ChessPiece } from "./ChessPiece";
import GameModel from "../Model/GameModel";
const { ccclass, property } = _decorator;

@ccclass("ChessPosition")
export class ChessPosition extends Component {
  @property
  public position: string = "";

  onLoad() {
    this.node.on(Node.EventType.TOUCH_END, this.onSelect, this);
  }

  start() {}

  update(deltaTime: number) {}

  private onSelect() {
    const canSelect = GameModel.isDebug
      ? this.getComponentInChildren(ChessPiece) !== null
      : this.getComponentInChildren(ChessPiece) &&
        this.getComponentInChildren(ChessPiece).role === GameModel.role;
    if (canSelect) {
      Event.event.emit(EventType.CANCEL_SELECT, this.position);
    } else {
      Event.event.emit(EventType.CLICK_POSITION, this.position);
    }
  }
}
