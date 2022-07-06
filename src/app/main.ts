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

function getUserList(userRepo: UserRepository, depositLedger: DepositLedger) {
  return asyncHandler(async (_req, res) => {
    const allUsers = await userRepo.getAll();
    const response = await Promise.all(
      allUsers.map(async u => ({
        ...u,
        balance: await depositLedger.getBalance(u.id),
      }))
    );
    res.json(response);
  });
}

function addUser(userRepo: UserRepository) {
  return asyncHandler(async (req, res) => {
    const {email} = req.body;

    if (await userRepo.userExistsByEmail(email)) {
      badRequest(res, `User with email [${email}] already exists`);
    } else {
      const newUser = await userRepo.addUser(email);
      res.status(201).json(newUser);
    }
  });
}

function depositAmount(userRepo: UserRepository, depositLedger: DepositLedger) {
  async function balanceWillGoBelowZero(userId: number, depositAmount: number) {
    const balance = await depositLedger.getBalance(userId);
    return balance + depositAmount < 0;
  }

  return asyncHandler(async (req, res) => {
    const {userId, amount} = req.body;

    const userExists = await userRepo.userExistsById(userId);
    if (!userExists) {
      badRequest(res, `User by id [${userId}] does not exist`);
    } else if (await balanceWillGoBelowZero(userId, amount)) {
      badRequest(
        res,
        `Too big amount to withdraw: [${amount}] from user by id: [${userId}]`
      );
    } else {
      const newDeposit = await depositLedger.deposit(userId, amount);
      res.status(201).json(newDeposit);
    }
  });
}

export function createApp(params: ApplicationDependencies) {
  const {userRepository, depositLedger} = params;

  const app = express();
  app.use(express.json());

  app.get('/api/ping', (_req, res) => {
    res.send('pong');
  });

  app.get('/api/users', getUserList(userRepository, depositLedger));
  app.post('/api/users', addUser(userRepository));
  app.post('/api/deposits', depositAmount(userRepository, depositLedger));

  return app;
}
