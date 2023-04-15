export enum RoleEnum {
  A,
  B,
}

export default class GameModel {
  public static role: RoleEnum = RoleEnum.A;
  public static get enemyRole(): RoleEnum {
    return GameModel.role === RoleEnum.A ? RoleEnum.B : RoleEnum.A;
  }

  public static selectedRole: RoleEnum = RoleEnum.A;
  public static turnRole: RoleEnum = RoleEnum.A;
  /** ${from pos}-${to pos} */
  public static stepRecord: string[] = [];
}
