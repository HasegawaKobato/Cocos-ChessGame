import {
  _decorator,
  Button,
  color,
  Color,
  Component,
  Label,
  LabelOutline,
  Node,
} from "cc";
import GameModel, { GameState, RoleEnum } from "../Model/GameModel";
import { Board } from "./Board";
const { ccclass, property } = _decorator;

@ccclass("GameOver")
export class GameOver extends Component {
  @property(Button)
  private restart: Button = null;

  @property(Label)
  private resultLabel: Label = null;

  start() {
    this.restart.node.on(Button.EventType.CLICK, this.onClickRestart, this);
  }

  public show(result: "Win" | "Game Over") {
    this.node.active = true;
    this.resultLabel.string = result;
    switch (result) {
      case "Win":
        this.resultLabel.color = color(0, 255, 0, 255);
        this.resultLabel.getComponent(LabelOutline).color = color(
          255,
          82,
          0,
          255
        );
        break;
      case "Game Over":
        this.resultLabel.color = Color.GRAY;
        this.resultLabel.getComponent(LabelOutline).color = Color.BLACK;
        break;
    }

    setTimeout(() => {
      if (GameModel.isEnemyCPU && GameModel.isSelfCPU) {
        this.onClickRestart();
      }
    }, 1000);
  }

  public close() {
    this.node.active = false;
  }

  private onClickRestart() {
    Board.instance.initBoard = true;
    GameModel.turnRole = RoleEnum.A;
    GameModel.isGameOver = false;
    this.close();
  }
}
