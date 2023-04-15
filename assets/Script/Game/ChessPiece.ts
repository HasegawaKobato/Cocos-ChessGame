import {
  _decorator,
  Color,
  Component,
  Enum,
  Layout,
  Material,
  Node,
  Sprite,
  SpriteFrame,
  tween,
  v3,
  Vec3,
  director,
  Camera,
} from "cc";
import { Board } from "./Board";
import Event, { EventType } from "./Event";
import { ChessPosition } from "./ChessPosition";
import GameModel, { GameState, RoleEnum } from "../Model/GameModel";
const { ccclass, property } = _decorator;

export enum ChessIdEnum {
  None,
  King,
  Queen,
  Bishop,
  Knight,
  Rook,
  Pawn,
}

export const ChessIdToName = {
  [ChessIdEnum.None]: "None",
  [ChessIdEnum.King]: "King",
  [ChessIdEnum.Queen]: "Queen",
  [ChessIdEnum.Bishop]: "Bishop",
  [ChessIdEnum.Knight]: "Knight",
  [ChessIdEnum.Rook]: "Rook",
  [ChessIdEnum.Pawn]: "Pawn",
};

export const chessIdStrToEnum = (str: string): ChessIdEnum => {
  switch (str) {
    case ChessIdToName[ChessIdEnum.None]:
      return ChessIdEnum.None;
    case ChessIdToName[ChessIdEnum.King]:
      return ChessIdEnum.King;
    case ChessIdToName[ChessIdEnum.Queen]:
      return ChessIdEnum.Queen;
    case ChessIdToName[ChessIdEnum.Bishop]:
      return ChessIdEnum.Bishop;
    case ChessIdToName[ChessIdEnum.Knight]:
      return ChessIdEnum.Knight;
    case ChessIdToName[ChessIdEnum.Rook]:
      return ChessIdEnum.Rook;
    case ChessIdToName[ChessIdEnum.Pawn]:
      return ChessIdEnum.Pawn;
  }
};

/** position string to data */
export const p2d = (pos: string): { n: number; e: string } => {
  return {
    n: Number(pos.match(/\d/g)?.[0]),
    e: pos.match(/\D/g)?.[0],
  };
};
@ccclass("ChessPiece")
export class ChessPiece extends Component {
  /**
   * 0: 國王　=> King
   * 1: 皇后　=> Queen
   * 2: 相　　=> Bishop
   * 3: 騎士　=> Knight
   * 4: 城牆　=> Rook
   * 5: 士兵　=> Pawn
   */
  @property([SpriteFrame])
  private chessImgMaps: SpriteFrame[] = [];

  @property(Node)
  private selectedNode: Node = null;

  @property(Node)
  private tmpMoveBoardNode: Node = null;

  @property(Sprite)
  private chessSprite: Sprite = null;

  @property
  private _position: string = "";
  @property
  public get position() {
    return this._position;
  }
  public set position(v: string) {
    this._position = v;
    this.updatePosition();
  }

  @property({ type: Enum(ChessIdEnum) })
  private _chessId: ChessIdEnum = ChessIdEnum.None;
  @property({ type: Enum(ChessIdEnum) })
  public get chessId() {
    return this._chessId;
  }
  public set chessId(v: ChessIdEnum) {
    this._chessId = v;
    this.changeSprite();
  }

  @property({ type: Enum(RoleEnum) })
  private _role: RoleEnum = RoleEnum.A;
  @property({ type: Enum(RoleEnum) })
  public get role() {
    return this._role;
  }
  public set role(v: RoleEnum) {
    this._role = v;
    this.changeSpriteColor();
  }

  @property
  private _isDead: boolean = false;
  @property
  public get isDead() {
    return this._isDead;
  }
  public set isDead(v: boolean) {
    if (v) {
      this.position = "";
      this.node.off(Node.EventType.TOUCH_END, this.onSelectChess, this);
    } else {
      this.node.on(Node.EventType.TOUCH_END, this.onSelectChess, this);
    }
    this._isDead = v;
  }

  public deadArea: Node = null;
  public steps: string[] = [];

  private get ePos(): string {
    return !this.isDead ? this.position.match(/\D/g)?.[0] : "";
  }
  private get nPos(): string {
    return !this.isDead ? this.position.match(/\d/g)?.[0] : "";
  }
  private _validPath: string[] = [];
  public get validPath(): string[] {
    return this._validPath;
  }
  public set validPath(v: string[]) {
    this._validPath = v.slice();
    Event.event.emit(EventType.SHOW_VALIDPATH, v.slice());
  }

  onLoad() {
    this.node.on(Node.EventType.TOUCH_END, this.onSelectChess, this);
    Event.event.on(EventType.CLICK_POSITION, this.toPosition, this);
    Event.event.on(EventType.CANCEL_SELECT, this.onCancelSpecicSelect, this);
    this.selectedNode.active = false;
  }

  update(deltaTime: number) {}

  public onCancelSelect() {
    this.selectedNode.active = false;
  }

  public updateCalculatePath() {
    GameModel.selectedRole = this.role;
    this.calculateValidPath();
  }

  private onCancelSpecicSelect(position: string) {
    if (!this.comparePosition(this.position, position)) {
      this.selectedNode.active = false;
    }
  }

  private updatePosition() {
    if (
      this.position.length !== 2 ||
      this.position.match(/\d|\w/g).length !== 2
    )
      return;
    if (
      Number(this.position.match(/\d/g)?.[0]) > 0 &&
      Number(this.position.match(/\d/g)?.[0]) < 9 &&
      "abcdefgh".includes(this.position.match(/\D/g)?.[0])
    ) {
      this.node.setParent(
        Board.instance.node.getChildByPath(
          `${this.position.match(/\d/g)?.[0]}/${
            this.position.match(/\D/g)?.[0]
          }`
        )
      );
      this.node.position = Vec3.ZERO;
    }
  }

  private changeSprite() {
    switch (this.chessId) {
      case ChessIdEnum.None:
        this.validPath = [];
        break;
      case ChessIdEnum.King:
        this.chessSprite.spriteFrame = this.chessImgMaps[0];
        break;
      case ChessIdEnum.Queen:
        this.chessSprite.spriteFrame = this.chessImgMaps[1];
        break;
      case ChessIdEnum.Bishop:
        this.chessSprite.spriteFrame = this.chessImgMaps[2];
        break;
      case ChessIdEnum.Knight:
        this.chessSprite.spriteFrame = this.chessImgMaps[3];
        break;
      case ChessIdEnum.Rook:
        this.chessSprite.spriteFrame = this.chessImgMaps[4];
        break;
      case ChessIdEnum.Pawn:
        this.chessSprite.spriteFrame = this.chessImgMaps[5];
        break;
    }
  }

  private changeSpriteColor() {
    this.chessSprite.color =
      this.role === GameModel.role ? Color.WHITE : Color.RED;
  }

  public onSelectChess() {
    this.selectedNode.active = true;
    GameModel.selectedRole = this.role;
    this.calculateValidPath();
  }

  private async toPosition(target: string) {
    if (this.selectedNode.active) {
      const isValidPath = this.validPath.includes(target);
      this.validPath = [];
      if (isValidPath && this.role === GameModel.turnRole) {
        this.validPath = [];
        if (!this.isSelfWithSelected(p2d(target).e, p2d(target).n)) {
          const enemyPiece = Board.instance.node
            .getChildByPath(`${p2d(target).n}/${p2d(target).e}`)
            .getComponentsInChildren(ChessPiece)
            .filter(
              (chess) =>
                chess.role ===
                (GameModel.turnRole === RoleEnum.A ? RoleEnum.B : RoleEnum.A)
            )?.[0];
          if (enemyPiece) {
            Event.event.emit(EventType.KILLED, this.role, enemyPiece.node);

            if (enemyPiece.chessId === ChessIdEnum.King) {
              GameModel.isGameOver = true;
              Event.event.emit(EventType.GAME_OVER, this.role);
            }
          }
        } else {
          // 城王易位
          if (this.chessId === ChessIdEnum.King) {
            if (target === "g1") {
              if (
                this.getChessFromPos("h1").chessId === ChessIdEnum.Rook &&
                this.getChessFromPos("h1").steps.length === 0
              ) {
                this.getChessFromPos("h1").position = "f1";
              }
            } else if (target === "c1") {
              if (
                this.getChessFromPos("a1").chessId === ChessIdEnum.Rook &&
                this.getChessFromPos("a1").steps.length === 0
              ) {
                this.getChessFromPos("a1").position = "d1";
              }
            }
          }
        }

        let pawnChanging = false;
        if (!GameModel.isGameOver && this.chessId === ChessIdEnum.Pawn) {
          if (p2d(target).e !== this.ePos) {
            if (this.role === GameModel.role) {
              if (Number(this.nPos) === 5) {
                const nearChess = this.getChessFromPos(
                  `${p2d(target).e}${this.nPos}`
                );
                if (nearChess && nearChess.role !== this.role) {
                  Event.event.emit(EventType.KILLED, this.role, nearChess.node);
                }
              }
            } else {
              if (Number(this.nPos) === 4) {
                const nearChess = this.getChessFromPos(
                  `${p2d(target).e}${this.nPos}`
                );
                if (nearChess && nearChess.role !== this.role) {
                  Event.event.emit(EventType.KILLED, this.role, nearChess.node);
                }
              }
            }
          }

          if (
            (this.role === GameModel.role && p2d(target).n === 8) ||
            (this.role !== GameModel.role && p2d(target).n === 1)
          ) {
            pawnChanging = true;
            Event.event.emit(EventType.SELECT_PAWN_CHANGE, this);
          }
        }

        if (GameModel.turnRole === RoleEnum.A) {
          GameModel.gameState = GameState.ARunning;
        } else if (GameModel.turnRole === RoleEnum.B) {
          GameModel.gameState = GameState.BRunning;
        }
        await new Promise((res, rej) => {
          this.selectedNode.active = false;
          this.node.setParent(
            this.tmpMoveBoardNode.getChildByPath(`${this.nPos}/${this.ePos}`)
          );
          tween(this.node)
            .by(0.3, {
              position: v3(
                ("abcdefgh".indexOf(p2d(target).e) -
                  "abcdefgh".indexOf(this.ePos)) *
                  80,
                ("12345678".indexOf(`${p2d(target).n}`) -
                  "12345678".indexOf(this.nPos)) *
                  80,
                0
              ),
            })
            .call(() => {
              GameModel.stepRecord.push(`${this.position}-${target}`);
              this.node.setParent(Board.instance.node);
              this.position = target;
              this.steps.push(target);
              res(null);
            })
            .start();
        });

        if (!pawnChanging && !GameModel.isGameOver) {
          Event.event.emit(EventType.TURN);
        }
      }
    }
    this.selectedNode.active = false;
  }

  private calculateValidPath() {
    let tmpResult = [];
    let eRange: string[] = [];
    let nRange: string[] = [];
    const lt = [];
    const lb = [];
    const rt = [];
    const rb = [];
    const al = [];
    const ar = [];
    const at = [];
    const ab = [];
    let selfEIdx = -1;
    let selfNIdx = -1;
    switch (this.chessId) {
      case ChessIdEnum.None:
        this.chessSprite.spriteFrame = null;
        break;

      /** ===========Completed========== */
      case ChessIdEnum.King:
        eRange = [this.ePos];
        if (this.ePos.charCodeAt(0) > 97)
          eRange.push(String.fromCharCode(this.ePos.charCodeAt(0) - 1));
        if (this.ePos.charCodeAt(0) < 104)
          eRange.push(String.fromCharCode(this.ePos.charCodeAt(0) + 1));

        nRange = [this.nPos];
        if (Number(this.nPos) > 1) nRange.push(`${Number(this.nPos) - 1}`);
        if (Number(this.nPos) < 8) nRange.push(`${Number(this.nPos) + 1}`);

        eRange.forEach((e) => {
          nRange.forEach((n) => {
            if (!this.comparePosition(this.position, `${e}${n}`)) {
              if (!this.isSelfWithSelected(e, n)) {
                tmpResult.push(`${e}${n}`);
              }
            }
          });
        });

        if (this.steps.length === 0) {
          if (!this.getChessFromPos("f1") && !this.getChessFromPos("g1")) {
            if (
              this.getChessFromPos("h1")?.chessId === ChessIdEnum.Rook &&
              this.getChessFromPos("h1")?.steps.length === 0
            ) {
              tmpResult.push("g1");
            }
          } else if (
            !this.getChessFromPos("b1") &&
            !this.getChessFromPos("c1") &&
            !this.getChessFromPos("d1")
          ) {
            if (
              this.getChessFromPos("a1")?.chessId === ChessIdEnum.Rook &&
              this.getChessFromPos("a1")?.steps.length === 0
            ) {
              tmpResult.push("c1");
            }
          }
        }
        break;

      /** ===========Completed========== */
      case ChessIdEnum.Queen:
        eRange = Array.from({ length: 8 }, (v, i) =>
          String.fromCharCode(i + 97)
        );
        nRange = Array.from({ length: 8 }, (v, i) => `${i + 1}`);
        selfEIdx = eRange.indexOf(this.ePos);
        selfNIdx = nRange.indexOf(this.nPos);

        /** [左、左上、上、右上、右、右下、下、左下] */
        const queenStops = Array.from({ length: 8 }, () => false);
        const tmpQueenPath = [];
        eRange.forEach((e, i) => {
          if (!this.comparePosition(this.position, `${e}${this.nPos}`)) {
            const targetN = [
              i - selfEIdx + selfNIdx + 1,
              selfEIdx - i + selfNIdx + 1,
            ];
            targetN.forEach((n) => {
              if (nRange.includes(`${n}`)) {
                tmpQueenPath.push(`${e}${n}`);
              }
            });
            if (selfEIdx - i > 0) {
              al.push(`${e}${this.nPos}`);
            } else {
              ar.push(`${e}${this.nPos}`);
            }
          }
        });
        nRange.forEach((n, i) => {
          if (!this.comparePosition(this.position, `${this.ePos}${n}`)) {
            if (selfNIdx - i > 0) {
              ab.push(`${this.ePos}${n}`);
            } else {
              at.push(`${this.ePos}${n}`);
            }
          }
        });

        tmpQueenPath.forEach((path) => {
          const tmpEIdx = eRange.indexOf(p2d(path).e);
          const tmpNIdx = nRange.indexOf(`${p2d(path).n}`);
          if (selfEIdx - tmpEIdx > 0) {
            if (selfNIdx - tmpNIdx < 0) {
              lt.push(path);
            } else {
              lb.push(path);
            }
          } else {
            if (selfNIdx - tmpNIdx < 0) {
              rt.push(path);
            } else {
              rb.push(path);
            }
          }
        });
        lt.sort((a, b) => p2d(a).n - p2d(b).n);
        lb.sort((a, b) => p2d(b).n - p2d(a).n);
        rt.sort((a, b) => p2d(a).n - p2d(b).n);
        rb.sort((a, b) => p2d(b).n - p2d(a).n);
        al.sort((a, b) => eRange.indexOf(p2d(b).e) - eRange.indexOf(p2d(a).e));
        at.sort((a, b) => p2d(a).n - p2d(b).n);
        ar.sort((a, b) => eRange.indexOf(p2d(a).e) - eRange.indexOf(p2d(b).e));
        ab.sort((a, b) => p2d(b).n - p2d(a).n);
        const tmpQueenDirectPath = [al, lt, at, rt, ar, rb, ab, lb];
        queenStops.forEach((stops, i) => {
          tmpQueenDirectPath[i].forEach((path) => {
            if (!stops && !this.isSelfWithSelected(p2d(path).e, p2d(path).n)) {
              tmpResult.push(`${p2d(path).e}${p2d(path).n}`);
              if (
                Board.instance.node
                  .getChildByPath(`${p2d(path).n}/${p2d(path).e}`)
                  .getComponentInChildren(ChessPiece) &&
                !this.isSelfWithSelected(p2d(path).e, p2d(path).n)
              ) {
                stops = true;
              }
            } else {
              stops = true;
            }
          });
        });
        break;

      /** ===========Completed========== */
      case ChessIdEnum.Bishop:
        eRange = Array.from({ length: 8 }, (v, i) =>
          String.fromCharCode(i + 97)
        );
        nRange = Array.from({ length: 8 }, (v, i) => `${i + 1}`);
        selfEIdx = eRange.indexOf(this.ePos);
        selfNIdx = nRange.indexOf(this.nPos);

        /** [左上、左下、右上、右下] */
        const bishopStops = [false, false, false, false];
        const tmpBishopPath = [];
        eRange.forEach((e, i) => {
          if (!this.comparePosition(this.position, `${e}${this.nPos}`)) {
            const targetN = [
              i - selfEIdx + selfNIdx + 1,
              selfEIdx - i + selfNIdx + 1,
            ];
            targetN.forEach((n) => {
              if (nRange.includes(`${n}`)) {
                tmpBishopPath.push(`${e}${n}`);
              }
            });
          }
        });

        tmpBishopPath.forEach((path) => {
          const tmpEIdx = eRange.indexOf(p2d(path).e);
          const tmpNIdx = nRange.indexOf(`${p2d(path).n}`);
          if (selfEIdx - tmpEIdx > 0) {
            if (selfNIdx - tmpNIdx < 0) {
              lt.push(path);
            } else {
              lb.push(path);
            }
          } else {
            if (selfNIdx - tmpNIdx < 0) {
              rt.push(path);
            } else {
              rb.push(path);
            }
          }
        });
        lt.sort((a, b) => p2d(a).n - p2d(b).n);
        lb.sort((a, b) => p2d(b).n - p2d(a).n);
        rt.sort((a, b) => p2d(a).n - p2d(b).n);
        rb.sort((a, b) => p2d(b).n - p2d(a).n);
        const tmpDirectPath = [lt, lb, rt, rb];
        bishopStops.forEach((stops, i) => {
          tmpDirectPath[i].forEach((path) => {
            if (!stops && !this.isSelfWithSelected(p2d(path).e, p2d(path).n)) {
              tmpResult.push(`${p2d(path).e}${p2d(path).n}`);
              if (
                Board.instance.node
                  .getChildByPath(`${p2d(path).n}/${p2d(path).e}`)
                  .getComponentInChildren(ChessPiece) &&
                !this.isSelfWithSelected(p2d(path).e, p2d(path).n)
              ) {
                stops = true;
              }
            } else {
              stops = true;
            }
          });
        });
        break;
      case ChessIdEnum.Knight:
        eRange = Array.from({ length: 8 }, (v, i) =>
          String.fromCharCode(i + 97)
        );
        nRange = Array.from({ length: 8 }, (v, i) => `${i + 1}`);
        selfEIdx = eRange.indexOf(this.ePos);
        selfNIdx = nRange.indexOf(this.nPos);
        const tmpKnightPath = [];
        if (
          this.isValidE(eRange[selfEIdx - 1]) &&
          this.isValidN(Number(this.nPos) + 2)
        ) {
          tmpKnightPath.push(`${eRange[selfEIdx - 1]}${Number(this.nPos) + 2}`);
        }
        if (
          this.isValidE(eRange[selfEIdx - 1]) &&
          this.isValidN(Number(this.nPos) - 2)
        ) {
          tmpKnightPath.push(`${eRange[selfEIdx - 1]}${Number(this.nPos) - 2}`);
        }
        if (
          this.isValidE(eRange[selfEIdx + 1]) &&
          this.isValidN(Number(this.nPos) + 2)
        ) {
          tmpKnightPath.push(`${eRange[selfEIdx + 1]}${Number(this.nPos) + 2}`);
        }
        if (
          this.isValidE(eRange[selfEIdx + 1]) &&
          this.isValidN(Number(this.nPos) - 2)
        ) {
          tmpKnightPath.push(`${eRange[selfEIdx + 1]}${Number(this.nPos) - 2}`);
        }
        if (
          this.isValidE(eRange[selfEIdx + 2]) &&
          this.isValidN(Number(this.nPos) + 1)
        ) {
          tmpKnightPath.push(`${eRange[selfEIdx + 2]}${Number(this.nPos) + 1}`);
        }
        if (
          this.isValidE(eRange[selfEIdx + 2]) &&
          this.isValidN(Number(this.nPos) - 1)
        ) {
          tmpKnightPath.push(`${eRange[selfEIdx + 2]}${Number(this.nPos) - 1}`);
        }
        if (
          this.isValidE(eRange[selfEIdx - 2]) &&
          this.isValidN(Number(this.nPos) + 1)
        ) {
          tmpKnightPath.push(`${eRange[selfEIdx - 2]}${Number(this.nPos) + 1}`);
        }
        if (
          this.isValidE(eRange[selfEIdx - 2]) &&
          this.isValidN(Number(this.nPos) - 1)
        ) {
          tmpKnightPath.push(`${eRange[selfEIdx - 2]}${Number(this.nPos) - 1}`);
        }
        tmpKnightPath.forEach((path) => {
          if (!this.isSelfWithSelected(p2d(path).e, p2d(path).n)) {
            tmpResult.push(`${p2d(path).e}${p2d(path).n}`);
          }
        });
        break;

      /** ===========Completed========== */
      case ChessIdEnum.Rook:
        eRange = Array.from({ length: 8 }, (v, i) =>
          String.fromCharCode(i + 97)
        );
        nRange = Array.from({ length: 8 }, (v, i) => `${i + 1}`);
        selfEIdx = eRange.indexOf(this.ePos);
        selfNIdx = nRange.indexOf(this.nPos);

        /** [左、上、右、下] */
        const rookStops = [false, false, false, false];
        eRange.forEach((e, i) => {
          if (!this.comparePosition(this.position, `${e}${this.nPos}`)) {
            if (selfEIdx - i > 0) {
              al.push(`${e}${this.nPos}`);
            } else {
              ar.push(`${e}${this.nPos}`);
            }
          }
        });
        nRange.forEach((n, i) => {
          if (!this.comparePosition(this.position, `${this.ePos}${n}`)) {
            if (selfNIdx - i > 0) {
              ab.push(`${this.ePos}${n}`);
            } else {
              at.push(`${this.ePos}${n}`);
            }
          }
        });
        al.sort((a, b) => eRange.indexOf(p2d(b).e) - eRange.indexOf(p2d(a).e));
        at.sort((a, b) => p2d(a).n - p2d(b).n);
        ar.sort((a, b) => eRange.indexOf(p2d(a).e) - eRange.indexOf(p2d(b).e));
        ab.sort((a, b) => p2d(b).n - p2d(a).n);
        const tmpRookDirectPath = [al, at, ar, ab];
        rookStops.forEach((stops, i) => {
          tmpRookDirectPath[i].forEach((path) => {
            if (!stops && !this.isSelfWithSelected(p2d(path).e, p2d(path).n)) {
              tmpResult.push(`${p2d(path).e}${p2d(path).n}`);
              if (
                Board.instance.node
                  .getChildByPath(`${p2d(path).n}/${p2d(path).e}`)
                  .getComponentInChildren(ChessPiece) &&
                !this.isSelfWithSelected(p2d(path).e, p2d(path).n)
              ) {
                stops = true;
              }
            } else {
              stops = true;
            }
          });
        });
        break;

      case ChessIdEnum.Pawn:
        const eMap = Array.from({ length: 8 }, (v, i) =>
          String.fromCharCode(i + 97)
        );
        selfEIdx = eMap.indexOf(this.ePos);

        eRange = [this.ePos];
        if (this.ePos.charCodeAt(0) > 97)
          eRange.push(String.fromCharCode(this.ePos.charCodeAt(0) - 1));
        if (this.ePos.charCodeAt(0) < 104)
          eRange.push(String.fromCharCode(this.ePos.charCodeAt(0) + 1));

        if (this.role === GameModel.role) {
          if (Number(this.nPos) < 8) {
            nRange = [`${Number(this.nPos) + 1}`];
          }
        } else {
          if (Number(this.nPos) > 1) {
            nRange = [`${Number(this.nPos) - 1}`];
          }
        }

        let tmpPawnStops = false;

        if (nRange.length) {
          eRange.forEach((e) => {
            if (this.ePos === e) {
              if (
                Board.instance.node
                  .getChildByPath(`${nRange[0]}/${this.ePos}`)
                  .getComponentInChildren(ChessPiece) === null
              ) {
                tmpResult.push(`${this.ePos}${nRange[0]}`);
              } else {
                tmpPawnStops = true;
              }
            } else {
              if (
                Board.instance.node
                  .getChildByPath(`${nRange[0]}/${e}`)
                  .getComponentInChildren(ChessPiece) &&
                !this.isSelfWithSelected(e, nRange[0])
              ) {
                tmpResult.push(`${e}${nRange[0]}`);
              }
            }
          });
        }

        // 第一動可以走兩格
        if (!tmpPawnStops) {
          if (this.role === GameModel.role) {
            if (Number(this.nPos) === 2) {
              if (!this.getChessFromPos(`${this.ePos}4`))
                tmpResult.push(`${this.ePos}4`);
            }
          } else {
            if (Number(this.nPos) === 7) {
              if (!this.getChessFromPos(`${this.ePos}5`))
                tmpResult.push(`${this.ePos}5`);
            }
          }
        }

        // 吃過路兵
        if (this.role === GameModel.role) {
          if (Number(this.nPos) === 5) {
            if (selfEIdx - 1 >= 0) {
              const nearChess = this.getChessFromPos(
                `${eMap[selfEIdx - 1]}${this.nPos}`
              );
              if (
                nearChess &&
                nearChess.chessId === ChessIdEnum.Pawn &&
                nearChess.steps.length === 1 &&
                nearChess.role !== this.role &&
                this.comparePosition(
                  GameModel.stepRecord[GameModel.stepRecord.length - 1].split(
                    "-"
                  )[0],
                  `${eMap[selfEIdx - 1]}7`
                )
              ) {
                tmpResult.push(`${eMap[selfEIdx - 1]}${Number(this.nPos) + 1}`);
              }
            }
            if (selfEIdx + 1 < 8) {
              const nearChess = this.getChessFromPos(
                `${eMap[selfEIdx + 1]}${this.nPos}`
              );
              if (
                nearChess &&
                nearChess.chessId === ChessIdEnum.Pawn &&
                nearChess.steps.length === 1 &&
                nearChess.role !== this.role &&
                this.comparePosition(
                  GameModel.stepRecord[GameModel.stepRecord.length - 1].split(
                    "-"
                  )[0],
                  `${eMap[selfEIdx + 1]}7`
                )
              ) {
                tmpResult.push(`${eMap[selfEIdx + 1]}${Number(this.nPos) + 1}`);
              }
            }
          }
        } else {
          if (Number(this.nPos) === 4) {
            if (selfEIdx - 1 >= 0) {
              const nearChess = this.getChessFromPos(
                `${eMap[selfEIdx - 1]}${this.nPos}`
              );
              if (
                nearChess &&
                nearChess.chessId === ChessIdEnum.Pawn &&
                nearChess.steps.length === 1 &&
                nearChess.role !== this.role &&
                this.comparePosition(
                  GameModel.stepRecord[GameModel.stepRecord.length - 1].split(
                    "-"
                  )[0],
                  `${eMap[selfEIdx - 1]}2`
                )
              ) {
                tmpResult.push(`${eMap[selfEIdx - 1]}${Number(this.nPos) - 1}`);
              }
            }
            if (selfEIdx + 1 < 8) {
              const nearChess = this.getChessFromPos(
                `${eMap[selfEIdx + 1]}${this.nPos}`
              );
              if (
                nearChess &&
                nearChess.chessId === ChessIdEnum.Pawn &&
                nearChess.steps.length === 1 &&
                nearChess.role !== this.role &&
                this.comparePosition(
                  GameModel.stepRecord[GameModel.stepRecord.length - 1].split(
                    "-"
                  )[0],
                  `${eMap[selfEIdx + 1]}2`
                )
              ) {
                tmpResult.push(`${eMap[selfEIdx + 1]}${Number(this.nPos) - 1}`);
              }
            }
          }
        }
        break;
    }
    this.validPath = tmpResult.slice();
  }

  private comparePosition(source: string, target: string) {
    if (!source || !target) return false;
    source = source.toLocaleLowerCase();
    source = `${source.match(/\D/g)?.[0]}${source.match(/\d/g)?.[0]}`;
    target = target.toLocaleLowerCase();
    target = `${target.match(/\D/g)?.[0]}${target.match(/\d/g)?.[0]}`;
    return source === target;
  }

  private isValidE(e: string) {
    return "abcdefgh".includes(e);
  }

  private isValidN(n: string | number) {
    return Number(n) > 0 && Number(n) < 9;
  }

  private isSelfWithSelected(e: string, n: string | number) {
    return (
      Board.instance.node
        .getChildByPath(`${n}/${e}`)
        .getComponentInChildren(ChessPiece)?.role === GameModel.selectedRole &&
      GameModel.selectedRole === GameModel.turnRole
    );
  }

  private isSelf(e: string, n: string | number) {
    return (
      Board.instance.node
        .getChildByPath(`${n}/${e}`)
        .getComponentInChildren(ChessPiece)?.role === GameModel.role
    );
  }

  private getChessFromPos(pos: string) {
    const n = p2d(pos).n;
    const e = p2d(pos).e;
    return Board.instance.node
      .getChildByPath(`${n}/${e}`)
      .getComponentInChildren(ChessPiece);
  }
}
