import express = require('express');

type ApplicationParams = {
  initialUsers?: any[];
};

type User = {
  id: number;
  email: string;
};
type NewUser = Omit<User, 'id'>;

class InMemoryUserRepository {
  private readonly users: User[];

  constructor(initialUsers: User[]) {
    this.users = [...initialUsers];
  }

  getAll(): User[] {
    return [...this.users];
  }

  addUser(userData: NewUser): User {
    const newUser = {id: this.getNextId(), ...userData};
    this.users.push(newUser);
    return newUser;
  }

  private getNextId() {
    return this.users.length + 1;
  }
}

export function createApp(params: ApplicationParams = {}) {
  const app = express();
  const userRepository = new InMemoryUserRepository(params.initialUsers || []);

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
    res.status(201).end();
  });

  return app;
}
