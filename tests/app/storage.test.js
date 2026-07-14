import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { loadContacts, saveContacts } from '../../app/storage.js';

function tempFilePath(name) {
  return path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'storage-')), name);
}

test('연락처 파일이 없으면 빈 배열을 돌려준다', () => {
  const filePath = tempFilePath('contacts.json');

  assert.deepEqual(loadContacts(filePath), []);
});

test('saveContacts로 저장한 연락처를 loadContacts로 그대로 읽을 수 있다', () => {
  const filePath = tempFilePath('contacts.json');
  const contacts = [{ id: 1, name: '홍길동', phone: '010-1234-5678', email: 'hong@example.com' }];

  saveContacts(filePath, contacts);

  assert.deepEqual(loadContacts(filePath), contacts);
});

test('연락처 파일이 깨져 있으면 파일 경로가 포함된 에러를 그대로 전달한다', () => {
  const filePath = tempFilePath('contacts.json');
  fs.writeFileSync(filePath, '{ invalid', 'utf-8');

  assert.throws(() => loadContacts(filePath), (err) => {
    assert.match(err.message, new RegExp(filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    return true;
  });
});

test('연락처 파일이 빈(0바이트) 파일이면 파일 경로가 포함된 에러를 그대로 전달한다', () => {
  const filePath = tempFilePath('contacts.json');
  fs.writeFileSync(filePath, '', 'utf-8');

  assert.throws(() => loadContacts(filePath), (err) => {
    assert.match(err.message, new RegExp(filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    return true;
  });
});

test('연락처 파일 내용이 배열이 아닌 객체이면 파일 경로가 포함된 에러를 던진다', () => {
  const filePath = tempFilePath('contacts.json');
  fs.writeFileSync(filePath, JSON.stringify({ a: 1 }), 'utf-8');

  assert.throws(() => loadContacts(filePath), (err) => {
    assert.match(err.message, new RegExp(filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    return true;
  });
});

test('연락처 파일 내용이 배열이 아닌 숫자이면 파일 경로가 포함된 에러를 던진다', () => {
  const filePath = tempFilePath('contacts.json');
  fs.writeFileSync(filePath, '42', 'utf-8');

  assert.throws(() => loadContacts(filePath), (err) => {
    assert.match(err.message, new RegExp(filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    return true;
  });
});
