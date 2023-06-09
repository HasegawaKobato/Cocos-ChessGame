import { _decorator, Component, Node } from "cc";
import Event, { EventType } from "./Event";
import { ChessPiece, p2d } from "./ChessPiece";
import GameModel, { GameState } from "../Model/GameModel";
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
    if (
      (GameModel.gameState === GameState.AThinking && GameModel.isSelfCPU) ||
      (GameModel.gameState === GameState.BThinking && GameModel.isEnemyCPU)
    )
      return;
    const canSelect =
      this.getComponentInChildren(ChessPiece)?.role === GameModel.turnRole;
    if (canSelect) {
      Event.event.emit(EventType.CANCEL_SELECT, this.position);
    } else {
      Event.event.emit(EventType.CLICK_POSITION, this.position);
    }
  }
}
