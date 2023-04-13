import {
  _decorator,
  Color,
  Component,
  find,
  instantiate,
  JsonAsset,
  Material,
  Node,
  NodePool,
  Prefab,
  Sprite,
} from "cc";
import { ChessPosition } from "./ChessPosition";
import {
  ChessIdEnum,
  chessIdStrToEnum,
  ChessIdToName,
  ChessPiece,
  p2d,
} from "./ChessPiece";
import Event, { EventType } from "./Event";
import GameModel from "../Model/GameModel";
const { ccclass, property, executeInEditMode } = _decorator;

interface IChessData {
  id: string;
  pos: string;
}

interface IInitData {
  self: IChessData[];
  enemy: IChessData[];
}

@ccclass("Board")
@executeInEditMode
export class Board extends Component {
  @property(JsonAsset)
  public chessInitJsonAsset: JsonAsset = null;

  @property(Material)
  private validMaterial: Material = null;

  @property([Color])
  private _cellColors: Color[] = [new Color()];
  @property([Color])
  private get cellColors(): Color[] {
    return this._cellColors;
  }
  private set cellColors(v: Color[]) {
    this._cellColors = v.slice();
    this.updateCellColor();
  }

  @property(Node)
  public chessPrefab: Node = null;

  @property
  public initBoard: boolean = false;

  public static instance: Board = null;

  private chessPool: NodePool = new NodePool();

  onLoad() {
    // this.updateCellColor();
    Board.instance = this;
    Event.event.on(EventType.SHOW_VALIDPATH, this.onShowValidPath, this);
  }

  start() {}

  update(deltaTime: number) {
    if (this.initBoard) {
      this.initBoard = false;
      this.initBoardChess();
    }
  }

  private onShowValidPath(v: string[]) {
    this.getComponentsInChildren(Sprite).forEach(
      (c) => (c.customMaterial = null)
    );
    v.forEach((path) => {
      this.node
        .getChildByPath(`${p2d(path).n}/${p2d(path).e}`)
        .getComponent(Sprite).customMaterial = this.validMaterial;
    });
  }

  public updateCellColor() {
    this.node.children.forEach((child, ci) => {
      if (!isNaN(Number(child.name))) {
        if (ci % 2 === 0) {
          child.children.forEach((c, i) => {
            c.name = "abcdefgh"[i];
            let chessPos: ChessPosition = c.getComponent(ChessPosition);
            if (!chessPos) {
              chessPos = c.addComponent(ChessPosition);
            }
            chessPos.position = `${c.name}${child.name}`;

            if (i % 2 === 0) {
              c.getComponent(Sprite).color = this.cellColors[0];
            } else {
              c.getComponent(Sprite).color = this.cellColors[1];
            }
          });
        } else {
          child.children.forEach((c, i) => {
            c.name = "abcdefgh"[i];
            let chessPos: ChessPosition = c.getComponent(ChessPosition);
            if (!chessPos) {
              chessPos = c.addComponent(ChessPosition);
            }
            chessPos.position = `${c.name}${child.name}`;

            if (i % 2 === 0) {
              c.getComponent(Sprite).color = this.cellColors[1];
            } else {
              c.getComponent(Sprite).color = this.cellColors[0];
            }
          });
        }
      }
    });
  }

  private initBoardChess() {
    find("Canvas")
      .getComponentsInChildren(ChessPiece)
      .forEach((chess) => this.chessPool.put(chess.node));
    this.scheduleOnce(() => {
      const initData: IInitData = this.chessInitJsonAsset.json as IInitData;
      // 生成我方棋子
      initData.self.forEach((d) => {
        const node = this.getChessNode();
        node.active = true;
        node.name = d.id;
        node.getComponent(ChessPiece).chessId = chessIdStrToEnum(d.id);
        node.getComponent(ChessPiece).role = GameModel.role;
        node.getComponent(ChessPiece).position = d.pos;
      });
      // 生成敵方方棋子
      initData.enemy.forEach((d) => {
        const node = this.getChessNode();
        node.active = true;
        node.name = d.id;
        node.getComponent(ChessPiece).chessId = chessIdStrToEnum(d.id);
        node.getComponent(ChessPiece).role = GameModel.enemyRole;
        node.getComponent(ChessPiece).position = d.pos;
      });
    }, 0);
  }

  private getChessNode(): Node {
    if (this.chessPool.size()) {
      return this.chessPool.get();
    } else {
      return instantiate(this.chessPrefab);
    }
  }
}
