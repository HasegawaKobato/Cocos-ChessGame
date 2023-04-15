import { _decorator, Button, Component, Node } from "cc";
import GameModel, { RoleEnum } from "../Model/GameModel";
import { ChessIdEnum, ChessPiece } from "./ChessPiece";
import Event, { EventType } from "./Event";
const { ccclass, property } = _decorator;

@ccclass("PawnChanger")
export class PawnChanger extends Component {
  @property(Button)
  private queen: Button = null;

  @property(Button)
  private bishop: Button = null;

  @property(Button)
  private knight: Button = null;

  @property(Button)
  private rook: Button = null;

  private changeTarget: ChessPiece = null;

  start() {}

  update(deltaTime: number) {}

  public show(comp: ChessPiece) {
    this.node.active = true;
    this.changeTarget = comp;

    const select = [
      this.onSelectQueen.bind(this),
      this.onSelectBishop.bind(this),
      this.onSelectKnight.bind(this),
      this.onSelectRook.bind(this),
    ];

    if (
      (GameModel.turnRole === RoleEnum.A && !GameModel.isSelfCPU) ||
      (GameModel.turnRole === RoleEnum.B && !GameModel.isEnemyCPU)
    ) {
      this.queen.node.on(Button.EventType.CLICK, this.onSelectQueen, this);
      this.bishop.node.on(Button.EventType.CLICK, this.onSelectBishop, this);
      this.knight.node.on(Button.EventType.CLICK, this.onSelectKnight, this);
      this.rook.node.on(Button.EventType.CLICK, this.onSelectRook, this);
    }
    setTimeout(() => {
      if (GameModel.turnRole === RoleEnum.A) {
        if (GameModel.isSelfCPU) {
          select[Math.floor(Math.random() * 4)]();
        }
      } else {
        if (GameModel.isEnemyCPU) {
          select[Math.floor(Math.random() * 4)]();
        }
      }
    }, 1000);
  }

  public close() {
    Event.event.emit(EventType.TURN);
    this.queen.node.off(Button.EventType.CLICK, this.onSelectQueen, this);
    this.bishop.node.off(Button.EventType.CLICK, this.onSelectBishop, this);
    this.knight.node.off(Button.EventType.CLICK, this.onSelectKnight, this);
    this.rook.node.off(Button.EventType.CLICK, this.onSelectRook, this);
    this.node.active = false;
  }

  private onSelectQueen() {
    this.changeTarget.chessId = ChessIdEnum.Queen;
    this.close();
  }

  private onSelectBishop() {
    this.changeTarget.chessId = ChessIdEnum.Bishop;
    this.close();
  }

  private onSelectKnight() {
    this.changeTarget.chessId = ChessIdEnum.Knight;
    this.close();
  }

  private onSelectRook() {
    this.changeTarget.chessId = ChessIdEnum.Rook;
    this.close();
  }
}
