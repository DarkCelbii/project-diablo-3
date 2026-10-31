import assert from 'node:assert/strict';
import { once } from 'node:events';
import { request as httpRequest } from 'node:http';
import test from 'node:test';
import { CLASSES, createRealmServer, MAX_BODY_BYTES, MAX_CHARACTERS } from '../src/server.mjs';

const TOKEN = 'test-only-development-token-never-use-in-production';

async function realm(t) {
  const server = createRealmServer({ token: TOKEN });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
      server.closeAllConnections();
    });
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = (path, options = {}) => fetch(`${base}${path}`, options);
  const create = (body, options = {}) => call('/api/characters', {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body), ...options,
  });
  return { call, create, base };
}

test('health and realm discovery work without a token', async (t) => {
  const { call } = await realm(t);
  const response = await call('/health');
  assert.equal(response.status, 200);
  assert.equal((await response.json()).stage, 'prototype');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual((await (await call('/api/realm')).json()).classes, CLASSES);
});

test('character reads and writes require the correct token', async (t) => {
  const { call, create } = await realm(t);
  for (const authorization of [undefined, 'Bearer wrong', `Bearer ${'x'.repeat(40)}`]) {
    for (const method of ['GET', 'POST']) {
      const response = await call('/api/characters', {
        method, headers: authorization ? { authorization } : {},
      });
      assert.equal(response.status, 401);
      assert.equal(response.headers.get('www-authenticate'), 'Bearer');
    }
  }
  const response = await create({ name: 'Aidan', class: 'wizard' });
  assert.equal(response.status, 201);
  const listed = await call('/api/characters', { headers: { Authorization: `Bearer ${TOKEN}` } });
  assert.equal((await listed.json()).characters.length, 1);
});

test('creation assigns server-owned fields and duplicate names are case insensitive', async (t) => {
  const { create } = await realm(t);
  const result = await create({ name: 'Aidan', class: 'barbarian' });
  const { character } = await result.json();
  assert.equal(character.level, 1);
  assert.match(character.id, /^[0-9a-f-]{36}$/);
  assert.ok(Number.isFinite(Date.parse(character.createdAt)));
  assert.equal((await create({ name: 'aidan', class: 'monk' })).status, 409);
});

test('invalid names, classes, shapes and forged level fields are rejected without storing data', async (t) => {
  const { call, create } = await realm(t);
  const invalid = [null, [], 'hello', {}, { name: 'A', class: 'wizard' },
    { name: '../admin', class: 'wizard' }, { name: 'Aidan\n', class: 'wizard' },
    { name: 'A'.repeat(17), class: 'wizard' },
    { name: 'Aidan', class: 'unknown' }, { name: 'Aidan', class: 'wizard', level: 70 },
    { name: 'Aidan', class: 'wizard', owner: 'someone-else' }];
  for (const body of invalid) {
    assert.equal((await create(body)).status, 400, JSON.stringify(body));
  }
  const response = await call('/api/characters', { headers: { Authorization: `Bearer ${TOKEN}` } });
  assert.deepEqual((await response.json()).characters, []);
});

test('bad JSON and unsupported body encodings return controlled errors', async (t) => {
  const { create } = await realm(t);
  assert.equal((await create({}, { body: '{bad json' })).status, 400);
  for (const headers of [
    { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'text/plain' },
    { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' },
  ]) {
    const response = await create({}, { headers });
    assert.equal(response.status, 415);
    assert.ok(!(await response.text()).includes(TOKEN));
  }
});

test('oversized fixed-length and chunked bodies return 413 and leave the server usable', async (t) => {
  const { create, call, base } = await realm(t);
  const body = JSON.stringify({ name: 'x'.repeat(MAX_BODY_BYTES), class: 'wizard' });
  assert.equal((await create({}, { body })).status, 413);
  const chunkedStatus = await new Promise((resolve, reject) => {
    const request = httpRequest(`${base}/api/characters`, {
      method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    }, (response) => {
      response.resume();
      response.on('end', () => resolve(response.statusCode));
    });
    request.on('error', reject);
    request.write(body.slice(0, 2048));
    request.end(body.slice(2048));
  });
  assert.equal(chunkedStatus, 413);
  assert.equal((await call('/health')).status, 200);
});

test('the development realm has a bounded character count', async (t) => {
  const { create } = await realm(t);
  for (let index = 0; index < MAX_CHARACTERS; index++) {
    assert.equal((await create({ name: `Hero${index}`, class: 'monk' })).status, 201);
  }
  assert.equal((await create({ name: 'Overflow', class: 'monk' })).status, 409);
});

test('each server starts with its own empty realm', async (t) => {
  const first = await realm(t);
  const second = await realm(t);
  await first.create({ name: 'Aidan', class: 'wizard' });
  const response = await second.call('/api/characters', { headers: { Authorization: `Bearer ${TOKEN}` } });
  assert.deepEqual((await response.json()).characters, []);
});

test('unknown routes and unsupported methods fail explicitly', async (t) => {
  const { call } = await realm(t);
  assert.equal((await call('/unknown')).status, 404);
  const response = await call('/api/characters', {
    method: 'DELETE', headers: { Authorization: `Bearer ${TOKEN}` },
  });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'GET, POST');
});

test('foreign Host headers are rejected', async (t) => {
  const { base } = await realm(t);
  // fetch normalizes Host; use a raw HTTP request to exercise the server guard.
  const status = await new Promise((resolve, reject) => {
    const request = httpRequest(`${base}/health`, {
      headers: { Host: 'attacker.example' },
    }, (response) => {
      response.resume();
      response.on('end', () => resolve(response.statusCode));
    });
    request.on('error', reject);
    request.end();
  });
  assert.equal(status, 400);
});

test('missing and weak configuration tokens cannot create a server', () => {
  for (const token of [undefined, '', 'short', 'x'.repeat(257), 'x'.repeat(32) + '\n']) {
    assert.throws(() => createRealmServer({ token }), /Development token/);
  }
});
