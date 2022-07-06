import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';
import {User} from '../src/core-types';

class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> {
  declare id: CreationOptional<number>;
  declare email: string;
}

function initModels(sequelize: Sequelize) {
  UserModel.init(
    {
      id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
      email: {type: DataTypes.STRING, allowNull: false, unique: true},
    },
    {tableName: 'Users', sequelize}
  );
}

function toUser(model: UserModel): User {
  return {id: model.id, email: model.email};
}

class SqlUserRepository {
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
