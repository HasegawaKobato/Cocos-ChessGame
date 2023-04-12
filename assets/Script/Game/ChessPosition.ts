import { _decorator, Component, Node } from "cc";
import Event, { EventType } from "./Event";
const { ccclass, property } = _decorator;

@ccclass("ChessPosition")
export class ChessPosition extends Component {
  @property
  public position: string = "";

  onLoad() {
    this.node.on(Node.EventType.TOUCH_END, this.onSelect, this);
  }

  start() {}

  update(deltaTime: number) {}

  private onSelect() {
    Event.event.emit(EventType.CLICK_POSITION, this.position);
  }
}
