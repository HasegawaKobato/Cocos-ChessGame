export enum RoleEnum {
  A,
  B,
}

export default class GameModel {
  // TODO: true的時候， 沒辦法吃子
  public static isDebug: boolean = false;

  public static role: RoleEnum = RoleEnum.A;
  public static get enemyRole(): RoleEnum {
    return GameModel.role === RoleEnum.A ? RoleEnum.B : RoleEnum.A;
  }

  public static selectedRole: RoleEnum = RoleEnum.A;
}
