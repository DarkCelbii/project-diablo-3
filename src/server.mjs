import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';

export const CLASSES = Object.freeze([
  'barbarian', 'crusader', 'demon-hunter', 'monk',
  'necromancer', 'witch-doctor', 'wizard',
]);
export const MAX_BODY_BYTES = 4096;
export const MAX_CHARACTERS = 12;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function send(response, status, data, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    ...headers,
  });
  response.end(JSON.stringify(data));
}

async function readJson(request) {
  if (request.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new HttpError(415, 'Content-Type must be application/json.');
  }
  if (request.headers['content-encoding']) {
    throw new HttpError(415, 'Compressed request bodies are not supported.');
  }
  const chunks = [];
  let bytes = 0;
  // Keep the request stream open on an early exit so a 413 can reach the client.
  for await (const chunk of request.iterator({ destroyOnReturn: false })) {
    bytes += chunk.length;
    if (bytes > MAX_BODY_BYTES) {
      request.resume();
      throw new HttpError(413, 'Request body exceeds 4096 bytes.');
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'Request body must contain valid JSON.');
  }
}

function validateCharacter(body) {
  if (!body || Array.isArray(body) || typeof body !== 'object'
    || Object.keys(body).length !== 2
    || typeof body.name !== 'string' || typeof body.class !== 'string') {
    throw new HttpError(400, 'Provide exactly the fields name and class.');
  }
  if (!/^[A-Za-z][A-Za-z0-9_]{2,15}$/.test(body.name)) {
    throw new HttpError(400, 'Name must be 3-16 ASCII letters, digits or underscores, starting with a letter.');
  }
  if (!CLASSES.includes(body.class)) {
    throw new HttpError(400, 'Choose a supported character class from GET /api/realm.');
  }
  return { name: body.name, class: body.class };
}

/** One developer's temporary, in-memory realm; no player account system yet. */
export function createRealmServer({ token } = {}) {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{32,256}$/.test(token)) {
    throw new Error('Development token must contain 32-256 letters, digits, underscores or hyphens.');
  }
  const tokenHash = createHash('sha256').update(token).digest();
  const characters = new Map();
  const server = createServer({ maxHeaderSize: 8192 }, async (request, response) => {
    try {
      const port = server.address()?.port;
      if (![`127.0.0.1:${port}`, `localhost:${port}`].includes(request.headers.host)) {
        throw new HttpError(400, 'Use the local server address.');
      }
      const url = new URL(request.url, `http://127.0.0.1:${port}`);
      if (request.method === 'GET' && url.pathname === '/health') {
        send(response, 200, { status: 'ok', service: 'project-diablo-3', version: '0.1.0', stage: 'prototype' });
        return;
      }
      if (request.method === 'GET' && url.pathname === '/api/realm') {
        send(response, 200, { id: 'local', name: 'Local Development Realm', classes: CLASSES });
        return;
      }
      if (url.pathname !== '/api/characters') {
        throw new HttpError(404, 'Route not found.');
      }
      const suppliedToken = /^Bearer ([A-Za-z0-9_-]{32,256})$/.exec(request.headers.authorization ?? '')?.[1];
      if (!suppliedToken || !timingSafeEqual(tokenHash, createHash('sha256').update(suppliedToken).digest())) {
        send(response, 401, { error: 'A valid development bearer token is required.' }, {
          'WWW-Authenticate': 'Bearer', 'Connection': 'close',
        });
        request.resume();
        return;
      }
      if (request.method === 'GET') {
        send(response, 200, { characters: [...characters.values()] });
        return;
      }
      if (request.method !== 'POST') {
        send(response, 405, { error: 'Method not allowed.' }, { Allow: 'GET, POST', Connection: 'close' });
        request.resume();
        return;
      }
      const input = validateCharacter(await readJson(request));
      const nameKey = input.name.toLowerCase();
      if (characters.has(nameKey)) {
        throw new HttpError(409, 'Character name is already in use.');
      }
      if (characters.size >= MAX_CHARACTERS) {
        throw new HttpError(409, 'This development realm is limited to 12 characters.');
      }
      const character = { id: randomUUID(), ...input, level: 1, createdAt: new Date().toISOString() };
      characters.set(nameKey, character);
      send(response, 201, { character });
    } catch (error) {
      // Unexpected internal errors do not expose stack traces or request secrets.
      send(response, error instanceof HttpError ? error.status : 500, {
        error: error instanceof HttpError ? error.message : 'Internal server error.',
      }, { Connection: 'close' });
      request.resume();
    }
  });
  server.headersTimeout = 5000;
  server.requestTimeout = 10000;
  server.timeout = 10000;
  server.keepAliveTimeout = 1000;
  server.maxRequestsPerSocket = 100;
  return server;
}
