// Start-up file for cPanel "Application Manager", which always runs app.js from the
// application root and has no setting for another file or command.
// package.sh copies this next to dist/ in the upload; it is not used anywhere else.
import path from 'node:path';

// The host starts the app with a PATH that has no Node.js tools, and the server runs
// `npx prisma ...` at start-up. Put the running Node's own folder first.
process.env.PATH = [path.dirname(process.execPath), process.env.PATH].filter(Boolean).join(path.delimiter);

// No top-level await: the host loads this file with require().
import('./dist/server.js').catch((error) => {
  console.error('Failed to load the server:', error);
  process.exit(1);
});
