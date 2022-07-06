import {Sequelize} from 'sequelize';
import {
  initModels,
  SqlDepositLedger,
  SqlUserRepository,
} from '../src/impl/sql-repositories';

describe('SQL implementations', () => {
  let userRepo: SqlUserRepository;
  let ledger: SqlDepositLedger;

  beforeEach(async () => {
    const sequelize = new Sequelize('sqlite::memory:', {logging: false});
    initModels(sequelize);
    await sequelize.sync();

    userRepo = new SqlUserRepository();
    ledger = new SqlDepositLedger();
  });

  describe(SqlUserRepository, () => {
    it('creates a user', async () => {
      const res = await userRepo.addUser('test@example.com');
      expect(res).toEqual({id: 1, email: 'test@example.com'});

      const users = await userRepo.getAll();
      expect(users).toEqual([{id: 1, email: 'test@example.com'}]);
    });

    it('answers if a user exists by id', async () => {
      const {id} = await userRepo.addUser('test@example.com');
      expect(await userRepo.userExistsById(id)).toBeTruthy();
      expect(await userRepo.userExistsById(id + 100)).toBeFalsy();
    });

    it('answers if a user exists by email', async () => {
      const email = 'test@example.com';
      await userRepo.addUser(email);

      expect(await userRepo.userExistsByEmail(email)).toBeTruthy();
      expect(await userRepo.userExistsByEmail('absent-' + email)).toBeFalsy();
    });
  });

  describe('SqlDepositLedger', () => {
    let userId: number;

    beforeEach(async () => {
      userId = await createUser('test@example.com');
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
      const anotherUserId = await createUser('another-user@example.com');

      await ledger.deposit(userId, 100);
      await ledger.deposit(userId, -20);
      await ledger.deposit(anotherUserId, 10);

      expect(await ledger.getBalance(userId)).toEqual(80);
      expect(await ledger.getBalance(anotherUserId)).toEqual(10);
    });

    async function createUser(email: string) {
      return (await userRepo.addUser(email)).id;
    }
  });
});
