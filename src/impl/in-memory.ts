import {Deposit, DepositLedger, User, UserRepository} from '../core-types';

export class InMemoryUserRepository implements UserRepository {
  private readonly users: User[];

  constructor(initialUsers: User[]) {
    this.users = [...initialUsers];
  }

  getAll(): User[] {
    return [...this.users];
  }

  userExistsByEmail(email: string) {
    return this.users.some(u => u.email === email);
  }

  userExistsById(userId: number) {
    return this.users.some(u => u.id === userId);
  }

  addUser(email: string): User {
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

  deposit(userId: number, amount: number) {
    const newDeposit = {id: this.getNextId(), userId, amount};
    this.deposits.push(newDeposit);
    return newDeposit;
  }

  getBalance(userId: number): number {
    return this.deposits
      .filter(d => d.userId === userId)
      .reduce((acc, d) => d.amount + acc, 0);
  }

  private getNextId() {
    return this.deposits.length + 1;
  }
}
