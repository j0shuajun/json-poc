import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { saveJson, loadJson } from './json-poc.js';

function tempFilePath(name) {
  return path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'json-poc-')), name);
}

test('saveJson으로 저장한 데이터를 loadJson으로 그대로 읽을 수 있다 (round-trip)', () => {
  const filePath = tempFilePath('contact.json');
  const data = { name: '홍길동', phone: '010-1234-5678' };

  saveJson(filePath, data);
  const loaded = loadJson(filePath);

  assert.deepEqual(loaded, data);
});

test('saveJson은 사람이 읽기 쉽도록 들여쓰기된 JSON 문자열을 저장한다', () => {
  const filePath = tempFilePath('contact.json');

  saveJson(filePath, { name: '홍길동' });
  const text = fs.readFileSync(filePath, 'utf-8');

  assert.match(text, /\n {2}"name"/);
});

test('loadJson은 JSON 형식이 깨진 파일에 대해 파일 경로가 포함된 에러를 던진다', () => {
  const filePath = tempFilePath('broken.json');
  fs.writeFileSync(filePath, '{ invalid', 'utf-8');

  assert.throws(() => loadJson(filePath), (err) => {
    assert.match(err.message, new RegExp(filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    return true;
  });
});

test('loadJson은 존재하지 않는 파일에 대해 ENOENT 예외를 그대로 전파한다', () => {
  const filePath = tempFilePath('missing.json');

  assert.throws(() => loadJson(filePath), (err) => {
    assert.equal(err.code, 'ENOENT');
    return true;
  });
});
