import { _decorator, Component, director, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Loading")
export class Loading extends Component {
  start() {
    director.loadScene("Game");
  }

  update(deltaTime: number) {}
}
