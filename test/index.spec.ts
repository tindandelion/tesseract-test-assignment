// eslint-disable-next-line node/no-unpublished-import
import {Express} from 'express';
import * as request from 'supertest';

import {createApp} from '../src/main';

function createRequest() {
  return request('http://localhost:3000/api');
}

function createRequest2(app: Express) {
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
      createRequest2(app).get('/api/ping').expect(200).expect('pong', done);
    });
  });

  describe('02 list users', () => {
    it('should return users', done => {
      createRequest2(app)
        .get('/api/users')
        .expect(200)
        .expect(
          [
            {
              id: 1,
              email: 'alice@example.com',
            },
            {
              id: 2,
              email: 'bob@example.com',
            },
          ],
          done
        );
    });
  });

  describe('03 add user', () => {
    it('should add user and return it', async () => {
      await createRequest2(app)
        .post('/api/users')
        .send({email: 'charlie@example.com'})
        .expect(201)
        .expect({id: 3, email: 'charlie@example.com'});

      await createRequest2(app)
        .get('/api/users')
        .send({email: 'charlie@example.com'})
        .expect(200)
        .expect([
          {
            id: 1,
            email: 'alice@example.com',
          },
          {
            id: 2,
            email: 'bob@example.com',
          },
          {id: 3, email: 'charlie@example.com'},
        ]);
    });
  });

  describe('04 add deposit', () => {
    it('should add deposit and return it', done => {
      createRequest2(app)
        .post('/api/deposits')
        .send({userId: 3, amount: 100})
        .expect(201)
        .expect({id: 4, userId: 3, amount: 100}, done);
    });
  });

  xdescribe('05 users with balances', () => {
    it('should return all users with balances', done => {
      createRequest()
        .get('/users')
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
