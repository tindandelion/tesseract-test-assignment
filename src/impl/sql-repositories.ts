import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';
import {Deposit, DepositLedger, User, UserRepository} from '../app/core-types';

class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> {
  declare id: CreationOptional<number>;
  declare email: string;
}

class DepositModel extends Model<
  InferAttributes<DepositModel>,
  InferCreationAttributes<DepositModel>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare amount: number;
}

function toUser(model: UserModel): User {
  return {id: model.id, email: model.email};
}

function toDeposit(model: DepositModel): Deposit {
  return {id: model.id, userId: model.userId, amount: model.amount};
}

export class SqlUserRepository implements UserRepository {
  async addUser(email: string) {
    const model = await UserModel.create({email});
    return toUser(model);
  }

  async userExistsById(id: number): Promise<boolean> {
    return await UserModel.findByPk(id).then(model => !!model);
  }

  async userExistsByEmail(email: string): Promise<boolean> {
    return await UserModel.findOne({where: {email}}).then(model => !!model);
  }

  async getAll(): Promise<User[]> {
    const models = await UserModel.findAll();
    return models.map(toUser);
  }
}

export class SqlDepositLedger implements DepositLedger {
  async getBalance(userId: number): Promise<number> {
    const value = await DepositModel.sum('amount', {where: {userId}});
    return value ?? 0;
  }

  async deposit(userId: number, amount: number): Promise<Deposit> {
    const model = await DepositModel.create({userId, amount});
    return toDeposit(model);
  }
}

export function initModels(sequelize: Sequelize) {
  UserModel.init(
    {
      id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
      email: {type: DataTypes.STRING, allowNull: false, unique: true},
    },
    {tableName: 'Users', sequelize}
  );
  DepositModel.init(
    {
      id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
      userId: {type: DataTypes.INTEGER, allowNull: false},
      amount: {type: DataTypes.DECIMAL, allowNull: false},
    },
    {tableName: 'Deposits', sequelize}
  );
  DepositModel.belongsTo(UserModel, {foreignKey: 'userId'});
}
