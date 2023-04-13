import { _decorator, Component, Node } from "cc";
import Event, { EventType } from "./Event";
import { ChessPiece } from "./ChessPiece";
import { PawnChanger } from "./PawnChanger";
const { ccclass, property } = _decorator;

@ccclass("Game")
export class Game extends Component {
  @property(PawnChanger)
  private pawnChanger: PawnChanger = null;

  start() {
    Event.event.on(
      EventType.SELECT_PAWN_CHANGE,
      this.onShowPawnChangePanel,
      this
    );
  }

  update(deltaTime: number) {}

  private onShowPawnChangePanel(comp: ChessPiece) {
    this.pawnChanger.show(comp);
  }
}
