import { execSync } from 'node:child_process';
import fs from 'node:fs';
import userRouter from '@/routes/user';
import { testClient } from 'hono/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import env from '../../../../env';

if (env.NODE_ENV !== 'test') {
  throw new Error("NODE_ENV must be 'test'");
}

const client = testClient(userRouter);

describe('users routes', () => {
  beforeAll(async () => {
    execSync('yarn drizzle-kit push');
  });

  afterAll(async () => {
    fs.rmSync('test.db', { force: true });
  });

  it('GET /users returns the correct message', async () => {
    const res = await client.users.$get('/users');
    expect(res.status).toBe(200);

    if (res.status === 200) {
      const json = await res.json();
      expect(json).toHaveProperty('message');
      expect(json.message).toBe('Hello All Users');
    }
  });

  it('GET /users returns the correct content type', async () => {
    const res = await client.users.$get('/users');
    expect(res.headers.get('content-type')).toContain('application/json');
  });
});
