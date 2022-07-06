import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';
import {Deposit, DepositLedger, User, UserRepository} from '../src/core-types';

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

function initModels(sequelize: Sequelize) {
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

function toUser(model: UserModel): User {
  return {id: model.id, email: model.email};
}

function toDeposit(model: DepositModel): Deposit {
  return {id: model.id, userId: model.userId, amount: model.amount};
}

class SqlUserRepository implements UserRepository {
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

class SqlDepositLedger implements DepositLedger {
  async getBalance(userId: number): Promise<number> {
    const value = await DepositModel.sum('amount', {where: {userId}});
    return value ?? 0;
  }

  async deposit(userId: number, amount: number): Promise<Deposit> {
    const model = await DepositModel.create({userId, amount});
    return toDeposit(model);
  }
}

describe(SqlUserRepository, () => {
  let repo: SqlUserRepository;

  beforeEach(async () => {
    const sequelize = new Sequelize('sqlite::memory:', {logging: false});
    initModels(sequelize);
    await sequelize.sync();

    repo = new SqlUserRepository();
  });

  it('creates a user', async () => {
    const res = await repo.addUser('test@example.com');
    expect(res).toEqual({id: 1, email: 'test@example.com'});

    const users = await repo.getAll();
    expect(users).toEqual([{id: 1, email: 'test@example.com'}]);
  });

  it('answers if a user exists by id', async () => {
    const {id} = await repo.addUser('test@example.com');
    expect(await repo.userExistsById(id)).toBeTruthy();
    expect(await repo.userExistsById(id + 100)).toBeFalsy();
  });

  it('answers if a user exists by email', async () => {
    const email = 'test@example.com';
    await repo.addUser(email);

    expect(await repo.userExistsByEmail(email)).toBeTruthy();
    expect(await repo.userExistsByEmail('absent-' + email)).toBeFalsy();
  });
});

describe('SqlDepositLedger', () => {
  let userRepo: SqlUserRepository;
  let ledger: SqlDepositLedger;
  let userId: number;

  beforeEach(async () => {
    const sequelize = new Sequelize('sqlite::memory:', {logging: false});
    initModels(sequelize);
    await sequelize.sync();

    ledger = new SqlDepositLedger();
    userRepo = new SqlUserRepository();

    userId = (await userRepo.addUser('test@example.com')).id;
  });

  it('returns zero balance if no deposits are registered', async () => {
    expect(await ledger.getBalance(userId)).toEqual(0);
  });

  it('registers the deposit', async () => {
    const deposit = await ledger.deposit(userId, 100);
    expect(deposit).toEqual({id: 1, userId, amount: 100});
    expect(await ledger.getBalance(userId)).toEqual(100);
  });

  it('sums the balance by user', async () => {
    const anotherUserId = (await userRepo.addUser('another-user@example.com'))
      .id;

    await ledger.deposit(userId, 100);
    await ledger.deposit(userId, -20);
    await ledger.deposit(anotherUserId, 10);

    expect(await ledger.getBalance(userId)).toEqual(80);
    expect(await ledger.getBalance(anotherUserId)).toEqual(10);
  });
});
