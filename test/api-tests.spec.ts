import {Express} from 'express';
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
});
