export type User = {
  id: number;
  email: string;
};

export type Deposit = {
  id: number;
  userId: number;
  amount: number;
};

export interface UserRepository {
  getAll(): User[];
  userExistsByEmail(email: string): boolean;
  userExistsById(userId: number): boolean;
  addUser(email: string): User;
}

export interface DepositLedger {
  getBalance(userId: number): number;
  deposit(userId: number, amount: number): Deposit;
}
