export enum RoleEnum {
  A,
  B,
}

export default class GameModel {
  public static isDebug: boolean = true;

  public static role: RoleEnum = RoleEnum.A;
  public static get enemyRole(): RoleEnum {
    return GameModel.role === RoleEnum.A ? RoleEnum.B : RoleEnum.A;
  }

  public static selectedRole: RoleEnum = RoleEnum.A;
}
