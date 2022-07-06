import {Express} from 'express';
// eslint-disable-next-line node/no-unpublished-import
import * as request from 'supertest';

import {createApp} from '../src/main';

function createRequest(app: Express) {
  return request(app);
}

describe('hello', () => {
  const initialUsers = [
    {
      id: 1,
      email: 'alice@example.com',
    },
    {
      id: 2,
      email: 'bob@example.com',
    },
  ];

  let app: Express;

  beforeEach(async () => {
    app = createApp({initialUsers});
  });

  it('should run', () => {
    expect(1).toBe(1);
  });

  describe('01 ping', () => {
    it('should return pong', done => {
      createRequest(app).get('/api/ping').expect(200).expect('pong', done);
    });
  });

  describe('02 list users', () => {
    it('should return users', done => {
      createRequest(app)
        .get('/api/users')
        .expect(200)
        .expect(
          [
            {
              id: 1,
              email: 'alice@example.com',
              balance: 0,
            },
            {
              id: 2,
              email: 'bob@example.com',
              balance: 0,
            },
          ],
          done
        );
    });
  });

  describe('03 add user', () => {
    it('should add user and return it', async () => {
      await createRequest(app)
        .post('/api/users')
        .send({email: 'charlie@example.com'})
        .expect(201)
        .expect({id: 3, email: 'charlie@example.com'});

      await createRequest(app)
        .get('/api/users')
        .send({email: 'charlie@example.com'})
        .expect(200)
        .expect([
          {
            id: 1,
            email: 'alice@example.com',
            balance: 0,
          },
          {
            id: 2,
            email: 'bob@example.com',
            balance: 0,
          },
          {
            id: 3,
            email: 'charlie@example.com',
            balance: 0,
          },
        ]);
    });
  });

  describe('04 add deposit', () => {
    it('should add deposit and return it', done => {
      createRequest(app)
        .post('/api/deposits')
        .send({userId: 3, amount: 100})
        .expect(201)
        .expect({id: 1, userId: 3, amount: 100}, done);
    });
  });

  describe('05 users with balances', () => {
    beforeEach(async () => {
      await createRequest(app)
        .post('/api/users')
        .send({email: 'charlie@example.com'})
        .expect(201);

      await createRequest(app)
        .post('/api/deposits')
        .send({userId: 1, amount: 100})
        .expect(201);

      await createRequest(app)
        .post('/api/deposits')
        .send({userId: 2, amount: 75})
        .expect(201);

      await createRequest(app)
        .post('/api/deposits')
        .send({userId: 3, amount: 100})
        .expect(201);

      await createRequest(app)
        .post('/api/deposits')
        .send({userId: 1, amount: -50})
        .expect(201);
    });

    it('should return all users with balances', done => {
      createRequest(app)
        .get('/api/users')
        .expect(200)
        .expect(
          [
            {
              id: 1,
              email: 'alice@example.com',
              balance: 50,
            },
            {
              id: 2,
              email: 'bob@example.com',
              balance: 75,
            },
            {
              id: 3,
              email: 'charlie@example.com',
              balance: 100,
            },
          ],
          done
        );
    });
  });
});
