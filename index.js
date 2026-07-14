import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { main } from './app/cli.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, 'app', 'contacts.json');

const rl = readline.createInterface({ input: stdin, output: stdout });

try {
  await main({ rl, filePath });
} finally {
  rl.close();
}
