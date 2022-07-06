import * as express from 'express';
import {DepositLedger, UserRepository} from './core-types';
import asyncHandler = require('express-async-handler');

type ApplicationDependencies = {
  userRepository: UserRepository;
  depositLedger: DepositLedger;
};

function badRequest(res: express.Response, message: string) {
  res.status(400).send(message);
}

export function createApp(params: ApplicationDependencies) {
  const {userRepository, depositLedger} = params;

  const app = express();
  app.use(express.json());

  app.get('/api/ping', (_req, res) => {
    res.send('pong');
  });

  app.get(
    '/api/users',
    asyncHandler(async (_req, res) => {
      const allUsers = await userRepository.getAll();
      const response = await Promise.all(
        allUsers.map(async u => ({
          ...u,
          balance: await depositLedger.getBalance(u.id),
        }))
      );
      res.json(response);
    })
  );

  app.post(
    '/api/users',
    asyncHandler(async (req, res) => {
      const {email} = req.body;
      if (await userRepository.userExistsByEmail(email)) {
        badRequest(res, `User with email [${email}] already exists`);
      } else {
        const newUser = await userRepository.addUser(email);
        res.status(201).json(newUser);
      }
    })
  );

  app.post(
    '/api/deposits',
    asyncHandler(async (req, res) => {
      const {userId, amount} = req.body;
      const userExists = await userRepository.userExistsById(userId);
      if (!userExists) {
        badRequest(res, `User by id [${userId}] does not exist`);
      } else {
        const balance = await depositLedger.getBalance(userId);
        if (balance + amount < 0) {
          badRequest(
            res,
            `Too big of amount to withdraw: [${amount}] from user by id: [${userId}]`
          );
        } else {
          const newDeposit = await depositLedger.deposit(userId, amount);
          res.status(201).json(newDeposit);
        }
      }
    })
  );

  return app;
}
