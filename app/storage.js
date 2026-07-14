import fs from 'node:fs';

import { loadJson, saveJson } from '../poc/json-poc.js';

export function loadContacts(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  return loadJson(filePath);
}

export function saveContacts(filePath, contacts) {
  saveJson(filePath, contacts);
}
