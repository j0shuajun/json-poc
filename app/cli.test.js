import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { main } from './cli.js';
import { loadContacts } from './storage.js';

function tempFilePath(name) {
  return path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cli-')), name);
}

function fakeRl(responses) {
  const queue = [...responses];
  return {
    question: async () => {
      if (queue.length === 0) {
        throw new Error('no more scripted input');
      }
      return queue.shift();
    },
  };
}

function fakeLog() {
  const lines = [];
  const log = (line) => lines.push(line);
  log.lines = lines;
  return log;
}

test('연락처가 없을 때 전체 목록을 보면 안내 메시지를 보여준다', async () => {
  const filePath = tempFilePath('contacts.json');
  const rl = fakeRl(['1', '0']);
  const log = fakeLog();

  await main({ rl, filePath, log });

  assert.ok(log.lines.some((line) => line.includes('등록된 연락처가 없습니다')));
});

test('연락처를 추가하면 목록에 나타나고 파일에도 저장된다', async () => {
  const filePath = tempFilePath('contacts.json');
  const rl = fakeRl(['4', '홍길동', '010-1234-5678', 'hong@example.com', '1', '0']);
  const log = fakeLog();

  await main({ rl, filePath, log });

  assert.ok(log.lines.some((line) => line.includes('추가되었습니다')));
  assert.ok(log.lines.some((line) => line.includes('홍길동')));
  assert.deepEqual(loadContacts(filePath), [
    { id: 1, name: '홍길동', phone: '010-1234-5678', email: 'hong@example.com' },
  ]);
});

test('ID로 검색하면 해당 연락처만 보여준다', async () => {
  const filePath = tempFilePath('contacts.json');
  const rl = fakeRl(['4', '홍길동', '010-1234-5678', 'hong@example.com', '2', '1', '0']);
  const log = fakeLog();

  await main({ rl, filePath, log });

  assert.ok(log.lines.some((line) => line.includes('[1] 홍길동')));
});

test('존재하지 않는 ID로 검색하면 안내 메시지를 보여주고 멈추지 않는다', async () => {
  const filePath = tempFilePath('contacts.json');
  const rl = fakeRl(['2', '999', '0']);
  const log = fakeLog();

  await main({ rl, filePath, log });

  assert.ok(log.lines.some((line) => line.includes('찾을 수 없습니다')));
});

test('키워드로 검색하면 일치하는 연락처만 보여준다', async () => {
  const filePath = tempFilePath('contacts.json');
  const rl = fakeRl(['4', '홍길동', '010-1234-5678', 'hong@example.com', '3', '홍', '0']);
  const log = fakeLog();

  await main({ rl, filePath, log });

  assert.ok(log.lines.some((line) => line.includes('[1] 홍길동')));
});

test('연락처를 수정하면 지정한 필드만 바뀌고 파일에도 반영된다', async () => {
  const filePath = tempFilePath('contacts.json');
  const rl = fakeRl([
    '4', '홍길동', '010-1234-5678', 'hong@example.com',
    '5', '1', '', '010-9999-0000', '',
    '0',
  ]);
  const log = fakeLog();

  await main({ rl, filePath, log });

  assert.ok(log.lines.some((line) => line.includes('수정되었습니다')));
  assert.deepEqual(loadContacts(filePath), [
    { id: 1, name: '홍길동', phone: '010-9999-0000', email: 'hong@example.com' },
  ]);
});

test('연락처를 삭제 확인(y)하면 목록과 파일에서 사라진다', async () => {
  const filePath = tempFilePath('contacts.json');
  const rl = fakeRl(['4', '홍길동', '010-1234-5678', 'hong@example.com', '6', '1', 'y', '0']);
  const log = fakeLog();

  await main({ rl, filePath, log });

  assert.ok(log.lines.some((line) => line.includes('삭제되었습니다')));
  assert.deepEqual(loadContacts(filePath), []);
});

test('삭제 확인에서 y가 아니면 삭제를 취소한다', async () => {
  const filePath = tempFilePath('contacts.json');
  const rl = fakeRl(['4', '홍길동', '010-1234-5678', 'hong@example.com', '6', '1', 'n', '0']);
  const log = fakeLog();

  await main({ rl, filePath, log });

  assert.ok(log.lines.some((line) => line.includes('삭제를 취소했습니다')));
  assert.equal(loadContacts(filePath).length, 1);
});

test('존재하지 않는 메뉴 번호를 입력하면 에러 안내 후 메뉴로 돌아간다', async () => {
  const filePath = tempFilePath('contacts.json');
  const rl = fakeRl(['9', '0']);
  const log = fakeLog();

  await main({ rl, filePath, log });

  assert.ok(log.lines.some((line) => line.includes('ERROR')));
});
