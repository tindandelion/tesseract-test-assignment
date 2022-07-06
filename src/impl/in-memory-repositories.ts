import {Deposit, DepositLedger, User, UserRepository} from '../core-types';

export class InMemoryUserRepository implements UserRepository {
  private readonly users: User[];

  constructor(initialUsers: User[]) {
    this.users = [...initialUsers];
  }

  async getAll(): Promise<User[]> {
    return [...this.users];
  }

  async userExistsByEmail(email: string) {
    return this.users.some(u => u.email === email);
  }

  async userExistsById(userId: number) {
    return this.users.some(u => u.id === userId);
  }

  async addUser(email: string): Promise<User> {
    const newUser = {id: this.getNextId(), email};
    this.users.push(newUser);
    return newUser;
  }

  private getNextId() {
    return this.users.length + 1;
  }
}

export class InMemoryDepositLedger implements DepositLedger {
  private readonly deposits: Deposit[] = [];

  async deposit(userId: number, amount: number) {
    const newDeposit = {id: this.getNextId(), userId, amount};
    this.deposits.push(newDeposit);
    return newDeposit;
  }

  async getBalance(userId: number): Promise<number> {
    return this.deposits
      .filter(d => d.userId === userId)
      .reduce((acc, d) => d.amount + acc, 0);
  }

  private getNextId() {
    return this.deposits.length + 1;
  }
}
