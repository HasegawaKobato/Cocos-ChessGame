import { _decorator, Button, Component, Node } from "cc";
import { ChessIdEnum, ChessPiece } from "./ChessPiece";
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

  start() {
    this.queen.node.on(Button.EventType.CLICK, this.onSelectQueen, this);
    this.bishop.node.on(Button.EventType.CLICK, this.onSelectBishop, this);
    this.knight.node.on(Button.EventType.CLICK, this.onSelectKnight, this);
    this.rook.node.on(Button.EventType.CLICK, this.onSelectRook, this);
  }

  update(deltaTime: number) {}

  public show(comp: ChessPiece) {
    this.node.active = true;
    this.changeTarget = comp;
  }

  public close() {
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
