import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { saveJson, loadJson } from '../../poc/json-poc.js';

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

test('saveJson/loadJson은 배열이 아닌 최상위 값(숫자/문자열/불리언/null)도 그대로 왕복한다', () => {
  for (const value of [42, 'just a string', true, null]) {
    const filePath = tempFilePath('value.json');
    saveJson(filePath, value);
    assert.deepEqual(loadJson(filePath), value);
  }
});

test('saveJson/loadJson은 특수문자·이모지·개행이 섞인 문자열도 손상 없이 왕복한다', () => {
  const filePath = tempFilePath('special.json');
  const data = { text: '한글, "따옴표", \n개행, 😀 이모지, \t탭' };

  saveJson(filePath, data);

  assert.deepEqual(loadJson(filePath), data);
});

test('saveJson은 값이 undefined인 필드를 조용히 생략한다 (JSON.stringify 규약)', () => {
  const filePath = tempFilePath('undefined-field.json');

  saveJson(filePath, { a: undefined, b: 1 });

  assert.deepEqual(loadJson(filePath), { b: 1 });
});

test('loadJson은 빈(0바이트) 파일에 대해 파일 경로가 포함된 에러를 던진다', () => {
  const filePath = tempFilePath('empty.json');
  fs.writeFileSync(filePath, '', 'utf-8');

  assert.throws(() => loadJson(filePath), (err) => {
    assert.match(err.message, new RegExp(filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    return true;
  });
});

test('saveJson은 순환 참조가 있는 객체를 저장하려 하면 파일 경로가 포함된 에러를 던진다', () => {
  const filePath = tempFilePath('circular.json');
  const circular = {};
  circular.self = circular;

  assert.throws(() => saveJson(filePath, circular), (err) => {
    assert.match(err.message, new RegExp(filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    return true;
  });
});
