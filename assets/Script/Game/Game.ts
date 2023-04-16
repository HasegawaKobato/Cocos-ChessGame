import { _decorator, Component, Node } from "cc";
import Event, { EventType } from "./Event";
import { ChessIdToName, ChessPiece } from "./ChessPiece";
import { PawnChanger } from "./PawnChanger";
import GameModel, { GameState, RoleEnum } from "../Model/GameModel";
import { GameOver } from "./GameOver";
import { Board } from "./Board";
const { ccclass, property } = _decorator;

@ccclass("Game")
export class Game extends Component {
  @property(PawnChanger)
  private pawnChanger: PawnChanger = null;

  @property(GameOver)
  private gameOver: GameOver = null;

  onLoad() {
    Event.event.on(
      EventType.SELECT_PAWN_CHANGE,
      this.onShowPawnChangePanel,
      this
    );
    Event.event.on(EventType.GAME_OVER, this.onGameOver, this);
    Event.event.on(EventType.TURN, this.onTurn, this);
    Event.event.on(EventType.GAMESTATE_CHANGE, this.onGameStateChanged, this);
    Event.event.on(EventType.RESTART, this.onRestart, this);
  }

  start() {
    GameModel.gameState = GameState.ATurn;
  }

  update(deltaTime: number) {}

  private onShowPawnChangePanel(comp: ChessPiece) {
    GameModel.gameState = GameState.PwanChanging;
    this.pawnChanger.show(comp);
  }

  private onGameOver(role: RoleEnum) {
    GameModel.gameState = GameState.GameOver;
    if (role === RoleEnum.A) {
      this.gameOver.show("Win");
    } else {
      this.gameOver.show("Game Over");
    }
  }

  private onGameStateChanged() {
    switch (GameModel.gameState) {
      case GameState.ATurn:
        GameModel.gameState = GameState.AThinking;
        if (GameModel.isSelfCPU) {
          this.autoStep();
        }
        break;

      case GameState.BTurn:
        GameModel.gameState = GameState.BThinking;
        if (GameModel.isEnemyCPU) {
          this.autoStep();
        }
        break;
    }
  }

  private onTurn() {
    GameModel.turnRole =
      GameModel.turnRole === RoleEnum.A ? RoleEnum.B : RoleEnum.A;
    if (GameModel.turnRole === RoleEnum.A) {
      GameModel.gameState = GameState.ATurn;
    } else if (GameModel.turnRole === RoleEnum.B) {
      GameModel.gameState = GameState.BTurn;
    }
  }

  private async autoStep() {
    const aliveChess = Board.instance
      .getComponentsInChildren(ChessPiece)
      .filter((chess) => !chess.isDead && chess.role === GameModel.turnRole);
    aliveChess.forEach((chess) => chess.updateCalculatePath());
    const usableChess = aliveChess
      .filter((chess) => chess.validPath.length > 0)
      .map((chess) => ({
        chess,
        chessName: ChessIdToName[chess.chessId],
        validPath: chess.validPath,
      }));

    const targetChessIdx = Math.floor(Math.random() * usableChess.length);
    const targetActionIdx = Math.floor(
      Math.random() * usableChess[targetChessIdx].validPath.length
    );

    usableChess[targetChessIdx].chess.onSelectChess();
    await this.waitFor(500);
    Event.event.emit(
      EventType.CLICK_POSITION,
      usableChess[targetChessIdx].validPath[targetActionIdx]
    );
  }

  private onRestart() {
    Board.instance.initBoard = true;
    GameModel.turnRole = RoleEnum.A;
    GameModel.isGameOver = false;
  }

  private waitFor(seconds: number) {
    return new Promise((res, rej) => {
      setTimeout(() => {
        res(null);
      }, seconds);
    });
  }
}
