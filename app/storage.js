import fs from 'node:fs';

import { loadJson, saveJson } from '../poc/json-poc.js';

export function loadContacts(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const data = loadJson(filePath);
  if (!Array.isArray(data)) {
    throw new Error(`Contacts file must contain an array: ${filePath}`);
  }
  return data;
}

export function saveContacts(filePath, contacts) {
  saveJson(filePath, contacts);
}
