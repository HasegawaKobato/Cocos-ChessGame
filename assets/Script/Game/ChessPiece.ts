import {
  _decorator,
  Color,
  Component,
  Enum,
  Node,
  Sprite,
  SpriteFrame,
} from "cc";
import { Board } from "./Board";
import Event, { EventType } from "./Event";
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

  @property
  private _isSelf: boolean = false;
  @property
  public get isSelf() {
    return this._isSelf;
  }
  public set isSelf(v: boolean) {
    this._isSelf = v;
    this.changeSpriteColor();
  }

  private get ePos(): string {
    return this.position.match(/\D/g)?.[0];
  }
  private get nPos(): string {
    return this.position.match(/\d/g)?.[0];
  }
  private validPath: string[] = [];

  onLoad() {
    this.node.on(Node.EventType.TOUCH_END, this.onSelectChess, this);
  }

  start() {
    this.selectedNode.active = false;
  }

  update(deltaTime: number) {}

  public onCancelSelect() {
    this.selectedNode.active = false;
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
    this.chessSprite.color = this.isSelf ? Color.WHITE : Color.RED;
  }

  private onSelectChess() {
    Event.event.off(EventType.CLICK_POSITION, this.toPosition, this);
    this.selectedNode.active = true;
    this.calculateValidPath();
    this.scheduleOnce(() => {
      Event.event.on(EventType.CLICK_POSITION, this.toPosition, this);
    }, 0);
  }

  private toPosition(target: string) {
    if (this.selectedNode.active) {
      this.selectedNode.active = false;
      if (
        !this.comparePosition(this.position, target) &&
        this.validPath.includes(target)
      ) {
        this.position = target;
        console.log(target);
      }
    }
  }

  private calculateValidPath() {
    let tmpResult = [];
    let eRange: string[] = [];
    let nRange: string[] = [];
    let eStop = false;
    let nStop = false;
    switch (this.chessId) {
      case ChessIdEnum.None:
        this.chessSprite.spriteFrame = null;
        break;
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
              if (
                !Board.instance.node
                  .getChildByPath(`${n}/${e}`)
                  .getComponentInChildren(ChessPiece)?.isSelf
              ) {
                tmpResult.push(`${e}${n}`);
              }
            }
          });
        });
        break;
      case ChessIdEnum.Queen:
        this.chessSprite.spriteFrame = this.chessImgMaps[1];
        break;
      case ChessIdEnum.Bishop:
        eRange = Array.from({ length: 8 }, (v, i) =>
          String.fromCharCode(i + 97)
        );
        nRange = Array.from({ length: 8 }, (v, i) => `${i + 1}`);

        eRange.forEach((e, i) => {
          if (!this.comparePosition(this.position, `${e}${this.nPos}`)) {
            const selfEIdx = eRange.indexOf(this.ePos);
            const selfNIdx = nRange.indexOf(this.nPos);
            const targetN = [
              i - selfEIdx + selfNIdx + 1,
              selfEIdx - i + selfNIdx + 1,
            ];
            targetN.forEach((n) => {
              if (nRange.includes(`${n}`)) {
                if (
                  !eStop &&
                  !Board.instance.node
                    .getChildByPath(`${n}/${e}`)
                    .getComponentInChildren(ChessPiece)?.isSelf
                ) {
                  tmpResult.push(`${e}${n}`);
                } else {
                  eStop = true;
                }
              }
            });
          }
        });
        break;
      case ChessIdEnum.Knight:
        this.chessSprite.spriteFrame = this.chessImgMaps[3];
        break;
      case ChessIdEnum.Rook:
        eRange = Array.from({ length: 8 }, (v, i) =>
          String.fromCharCode(i + 97)
        );
        nRange = Array.from({ length: 8 }, (v, i) => `${i + 1}`);

        eRange.forEach((e) => {
          if (!this.comparePosition(this.position, `${e}${this.nPos}`)) {
            if (
              !eStop &&
              !Board.instance.node
                .getChildByPath(`${this.nPos}/${e}`)
                .getComponentInChildren(ChessPiece)?.isSelf
            ) {
              tmpResult.push(`${e}${this.nPos}`);
            } else {
              eStop = true;
            }
          }
        });
        nRange.forEach((n) => {
          if (!this.comparePosition(this.position, `${this.ePos}${n}`)) {
            if (
              !nStop &&
              !Board.instance.node
                .getChildByPath(`${n}/${this.ePos}`)
                .getComponentInChildren(ChessPiece)?.isSelf
            ) {
              tmpResult.push(`${this.ePos}${n}`);
            } else {
              nStop = true;
            }
          }
        });
        break;
      case ChessIdEnum.Pawn:
        eRange = [this.ePos];
        if (this.ePos.charCodeAt(0) > 97)
          eRange.push(String.fromCharCode(this.ePos.charCodeAt(0) - 1));
        if (this.ePos.charCodeAt(0) < 104)
          eRange.push(String.fromCharCode(this.ePos.charCodeAt(0) + 1));

        if (this.isSelf) {
          if (Number(this.nPos) < 8) {
            nRange = [`${Number(this.nPos) + 1}`];
          }
        } else {
          if (Number(this.nPos) > 1) {
            nRange = [`${Number(this.nPos) - 1}`];
          }
        }

        if (nRange.length) {
          eRange.forEach((e) => {
            console.log(this.ePos, e);
            if (this.ePos === e) {
              if (
                Board.instance.node
                  .getChildByPath(`${nRange[0]}/${this.ePos}`)
                  .getComponentInChildren(ChessPiece) === null
              ) {
                tmpResult.push(`${this.ePos}${nRange[0]}`);
              }
            } else {
              if (
                Board.instance.node
                  .getChildByPath(`${nRange[0]}/${this.ePos}`)
                  .getComponentInChildren(ChessPiece) &&
                !Board.instance.node
                  .getChildByPath(`${nRange[0]}/${this.ePos}`)
                  .getComponentInChildren(ChessPiece).isSelf
              ) {
                tmpResult.push(`${this.ePos}${nRange[0]}`);
              }
            }
          });
        }
        break;
    }
    this.validPath = tmpResult.slice();
    console.log(this.validPath);
  }

  private comparePosition(source: string, target: string) {
    source = source.toLocaleLowerCase();
    source = `${source.match(/\D/g)?.[0]}${source.match(/\d/g)?.[0]}`;
    target = target.toLocaleLowerCase();
    target = `${target.match(/\D/g)?.[0]}${target.match(/\d/g)?.[0]}`;
    return source === target;
  }
}
