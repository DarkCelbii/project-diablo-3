import { randomBytes } from 'node:crypto';
import { createRealmServer } from './server.mjs';

const portText = process.env.PORT ?? '3000';
if (!/^\d+$/.test(portText) || Number(portText) < 1 || Number(portText) > 65535) {
  console.error('PORT must be an integer between 1 and 65535.');
  process.exit(1);
}

const generatedToken = process.env.PD3_DEV_TOKEN === undefined;
const token = process.env.PD3_DEV_TOKEN ?? randomBytes(32).toString('base64url');
let server;
try {
  server = createRealmServer({ token });
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

server.on('error', (error) => {
  console.error(`Unable to start the development realm (${error.code ?? 'server error'}).`);
  process.exitCode = 1;
});
server.listen(Number(portText), '127.0.0.1', () => {
  console.log(`Project Diablo 3 prototype: http://127.0.0.1:${portText}`);
  console.log('Character data is temporary and is cleared when the server stops.');
  if (generatedToken) {
    console.log(`Development bearer token: ${token}`);
    console.log('This local-only token expires when the process stops. Keep it private.');
  } else {
    console.log('Using the development bearer token from PD3_DEV_TOKEN.');
  }
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    server.close(() => { process.exitCode = 0; });
    const deadline = setTimeout(() => server.closeAllConnections(), 1000);
    deadline.unref();
  });
}
