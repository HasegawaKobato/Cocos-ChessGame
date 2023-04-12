import { _decorator, Component, Node, EventTouch, find } from "cc";
import { ChessPiece } from "./ChessPiece";

const { ccclass } = _decorator;

@ccclass("TouchCatcher")
export class TouchCatcher extends Component {
  public static clickDisabled = false;

  onLoad() {
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  private onTouchStart(event: EventTouch) {
    event.preventSwallow = !TouchCatcher.clickDisabled;
  }

  private onTouchMove(event: EventTouch) {
    event.preventSwallow = !TouchCatcher.clickDisabled;
  }

  private onTouchEnd(event: EventTouch) {
    event.preventSwallow = !TouchCatcher.clickDisabled;
    // if (!TouchCatcher.clickDisabled) {
    //   find("Canvas")
    //     .getComponentsInChildren(ChessPiece)
    //     .forEach((chess) => chess.onCancelSelect());
    // }
  }
}
