import * as express from 'express';

type User = {
  id: number;
  email: string;
};

type Deposit = {
  id: number;
  userId: number;
  amount: number;
};

type ApplicationParams = {
  initialUsers?: User[];
};

class InMemoryUserRepository {
  private readonly users: User[];

  constructor(initialUsers: User[]) {
    this.users = [...initialUsers];
  }

  getAll(): User[] {
    return [...this.users];
  }

  addUser(userData: Omit<User, 'id'>): User {
    const newUser = {id: this.getNextId(), ...userData};
    this.users.push(newUser);
    return newUser;
  }

  private getNextId() {
    return this.users.length + 1;
  }
}

class InMemoryDepositLedger {
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

export function createApp(params: ApplicationParams = {}) {
  const app = express();
  const userRepository = new InMemoryUserRepository(params.initialUsers || []);
  const depositLedger = new InMemoryDepositLedger();

  app.use(express.json());

  app.get('/api/ping', (req, res) => {
    res.send('pong');
  });

  app.get('/api/users', (req, res) => {
    const allUsers = userRepository.getAll();
    const response = allUsers.map(u => ({
      ...u,
      balance: depositLedger.getBalance(u.id),
    }));
    res.json(response);
  });

  app.post('/api/users', (req, res) => {
    const userData = req.body;
    const newUser = userRepository.addUser(userData);
    res.status(201).json(newUser);
  });

  app.post('/api/deposits', (req, res) => {
    const {userId, amount} = req.body;
    const newDeposit = depositLedger.deposit(userId, amount);
    res.status(201).json(newDeposit);
  });

  return app;
}
