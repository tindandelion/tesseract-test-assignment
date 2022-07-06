import {Express} from 'express';
// eslint-disable-next-line node/no-unpublished-import
import * as request from 'supertest';
import {createTestApp} from './helpers';

class BackendApi {
  private readonly request;

  constructor(app: Express) {
    this.request = request(app);
  }

  ping() {
    return this.request
      .get('/api/ping')
      .expect(200)
      .then(res => res.text);
  }

  addUserRequest(email: string) {
    return this.request.post('/api/users').send({email});
  }

  addUser(email: string) {
    return this.addUserRequest(email)
      .expect(201)
      .then(res => res.body);
  }

  getUserList() {
    return this.request
      .get('/api/users')
      .expect(200)
      .then(res => res.body);
  }

  depositAmountRequest(userId: number, amount: number) {
    return this.request.post('/api/deposits').send({userId, amount});
  }

  depositAmount(userId: number, amount: number) {
    return this.depositAmountRequest(userId, amount)
      .expect(201)
      .then(res => res.body);
  }
}

describe('API tests', () => {
  let api: BackendApi;

  beforeEach(() => {
    api = new BackendApi(createTestApp());
  });

  describe('ping request', () => {
    it('responds to the ping request', async () => {
      const response = await api.ping();
      expect(response).toEqual('pong');
    });
  });

  describe('User management', () => {
    const userEmail = 'alice@example.com';

    it('adds a new user by email with a zero initial balance', async () => {
      const addedUser = await api.addUser(userEmail);

      const userList = await api.getUserList();
      expect(userList).toEqual([
        {id: addedUser.id, email: userEmail, balance: 0},
      ]);
    });

    it('responds with Bad Request if a user with given email already exists', async () => {
      await api.addUserRequest(userEmail).expect(201);
      await api.addUserRequest(userEmail).expect(400);
    });

    it('adds multiple users with different emails', async () => {
      const anotherUserEmail = 'bob@example.com';

      const {id: aliceId} = await api.addUser(userEmail);
      const {id: bobId} = await api.addUser(anotherUserEmail);

      const userList = await api.getUserList();
      expect(userList).toEqual([
        {id: aliceId, email: userEmail, balance: 0},
        {id: bobId, email: anotherUserEmail, balance: 0},
      ]);
    });
  });

  describe("User's deposit management", () => {
    const userEmail = 'charlie@example.com';
    let userId: number;

    beforeEach(async () => {
      const addedUser = await api.addUser(userEmail);
      userId = addedUser.id;
    });

    it("adds a deposited amount to the user's balance ", async () => {
      const addedDeposit = await api.depositAmount(userId, 100);

      const userList = await api.getUserList();
      expect(addedDeposit).toEqual({id: 1, userId, amount: 100});
      expect(userList).toEqual([{id: userId, email: userEmail, balance: 100}]);
    });

    it("withdraws from user's balance by depositing a negative amount", async () => {
      await api.depositAmount(userId, 100);
      await api.depositAmount(userId, -50);

      const userList = await api.getUserList();
      expect(userList).toEqual([{id: userId, email: userEmail, balance: 50}]);
    });

    it('responds with Bad Request when the user does not exist by id', async () => {
      const absentUserId = 1000;
      await api.depositAmountRequest(absentUserId, 100).expect(400);
    });

    it('responds with Bad Request when trying to withdraw more than the user has', async () => {
      await api.depositAmount(userId, 100);
      await api.depositAmountRequest(userId, -110).expect(400);

      const userList = await api.getUserList();
      expect(userList).toEqual([{id: userId, email: userEmail, balance: 100}]);
    });
  });
});
