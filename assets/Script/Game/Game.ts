import { _decorator, Component, Node } from "cc";
import Event, { EventType } from "./Event";
import { ChessPiece } from "./ChessPiece";
import { PawnChanger } from "./PawnChanger";
import GameModel, { RoleEnum } from "../Model/GameModel";
import { GameOver } from "./GameOver";
const { ccclass, property } = _decorator;

@ccclass("Game")
export class Game extends Component {
  @property(PawnChanger)
  private pawnChanger: PawnChanger = null;

  @property(GameOver)
  private gameOver: GameOver = null;

  start() {
    Event.event.on(
      EventType.SELECT_PAWN_CHANGE,
      this.onShowPawnChangePanel,
      this
    );
    Event.event.on(EventType.GAME_OVER, this.onGameOver, this);
    Event.event.on(EventType.TURN, this.onTurn, this);
  }

  update(deltaTime: number) {}

  private onShowPawnChangePanel(comp: ChessPiece) {
    this.pawnChanger.show(comp);
  }

  private onGameOver(role: RoleEnum) {
    if (role === RoleEnum.A) {
      this.gameOver.show("Win");
    } else {
      this.gameOver.show("Game Over");
    }
  }

  private onTurn() {
    GameModel.turnRole = GameModel.turnRole === RoleEnum.A ? RoleEnum.B : RoleEnum.A;
  }
}
