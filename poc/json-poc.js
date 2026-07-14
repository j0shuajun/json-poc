import fs from 'node:fs';

export function saveJson(filePath, data) {
  const text = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, text, 'utf-8');
}

export function loadJson(filePath) {
  const text = fs.readFileSync(filePath, 'utf-8');
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Invalid JSON in ${filePath}: ${err.message}`);
  }
}
