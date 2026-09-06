// Vercel serverless entry point.
// Vercel maps every file under /api to a serverless function; this one
// mounts the whole Express app and handles all /api/* routes via rewrites.
const app = require('../server');

module.exports = app;
