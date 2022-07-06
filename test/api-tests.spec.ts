import {Express} from 'express';
import {truncateSync} from 'fs';
// eslint-disable-next-line node/no-unpublished-import
import * as request from 'supertest';

import {createApp} from '../src/main';

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
}

describe('API tests', () => {
  let api: BackendApi;

  beforeEach(() => {
    api = new BackendApi(createApp());
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
      const addedUser = await api.addUser(userEmail)

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
});
