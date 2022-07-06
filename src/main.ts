import * as express from 'express';
import {DepositLedger, UserRepository} from './core-types';

type ApplicationDependencies = {
  userRepository: UserRepository
  depositLedger: DepositLedger
};

function badRequest(res: express.Response, message: string) {
  res.status(400).send(message);
}

export function createApp(params: ApplicationDependencies) {
  const { userRepository, depositLedger } = params

  const app = express();
  app.use(express.json());

  app.get('/api/ping', (_req, res) => {
    res.send('pong');
  });

  app.get('/api/users', (_req, res) => {
    const allUsers = userRepository.getAll();
    const response = allUsers.map(u => ({
      ...u,
      balance: depositLedger.getBalance(u.id),
    }));
    res.json(response);
  });

  app.post('/api/users', (req, res) => {
    const {email} = req.body;
    if (userRepository.userExistsByEmail(email)) {
      badRequest(res, `User with email [${email}] already exists`);
    } else {
      const newUser = userRepository.addUser(email);
      res.status(201).json(newUser);
    }
  });

  app.post('/api/deposits', (req, res) => {
    const {userId, amount} = req.body;
    if (!userRepository.userExistsById(userId)) {
      badRequest(res, `User by id [${userId}] does not exist`);
    } else if (depositLedger.getBalance(userId) + amount < 0) {
      badRequest(
        res,
        `Too big of amount to withdraw: [${amount}] from user by id: [${userId}]`
      );
    } else {
      const newDeposit = depositLedger.deposit(userId, amount);
      res.status(201).json(newDeposit);
    }
  });

  return app;
}
