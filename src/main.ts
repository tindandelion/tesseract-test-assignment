import express = require('express');

type ApplicationParams = {
  initialUsers?: any[];
};

type User = {
  id: number;
  email: string;
};

type Deposit = any;

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

class InMemoryDepositRepository {
  private readonly deposits: Deposit[] = [];

  deposit(userId: any, amount: any) {
    const newDeposit = {id: this.getNextId(), userId, amount};
    this.deposits.push(newDeposit);
    return newDeposit;
  }

  private getNextId() {
    return this.deposits.length + 1;
  }
}

export function createApp(params: ApplicationParams = {}) {
  const app = express();
  const userRepository = new InMemoryUserRepository(params.initialUsers || []);
  const depositRepository = new InMemoryDepositRepository();

  app.use(express.json());
  app.get('/api/ping', (req, res) => {
    res.send('pong');
  });
  app.get('/api/users', (req, res) => {
    res.json(userRepository.getAll());
  });
  app.post('/api/users', (req, res) => {
    const userData = req.body;
    const newUser = userRepository.addUser(userData);
    res.status(201).json(newUser);
  });
  app.post('/api/deposits', (req, res) => {
    const {userId, amount} = req.body;
    const newDeposit = depositRepository.deposit(userId, amount);
    res.status(201).json(newDeposit);
  });

  return app;
}
