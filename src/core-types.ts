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
  getAll(): Promise<User[]>;
  userExistsByEmail(email: string): Promise<boolean>;
  userExistsById(userId: number): Promise<boolean>;
  addUser(email: string): Promise<User>;
}

export interface DepositLedger {
  getBalance(userId: number): Promise<number>;
  deposit(userId: number, amount: number): Promise<Deposit>;
}
