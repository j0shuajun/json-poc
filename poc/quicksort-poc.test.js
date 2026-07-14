import { test } from 'node:test';
import assert from 'node:assert/strict';

import { sortArray } from './quicksort-poc.js';

test('무작위 순서 배열을 오름차순으로 정렬한다', () => {
  assert.deepEqual(sortArray([5, 3, 8, 1, 9, 2]), [1, 2, 3, 5, 8, 9]);
});

test('빈 배열은 그대로 빈 배열을 돌려준다', () => {
  assert.deepEqual(sortArray([]), []);
});

test('원소가 하나뿐인 배열은 그대로 돌려준다', () => {
  assert.deepEqual(sortArray([42]), [42]);
});

test('이미 정렬된 배열도 올바르게 정렬된 채로 유지한다', () => {
  assert.deepEqual(sortArray([1, 2, 3, 4]), [1, 2, 3, 4]);
});

test('역순으로 정렬된 배열도 오름차순으로 뒤집는다', () => {
  assert.deepEqual(sortArray([4, 3, 2, 1]), [1, 2, 3, 4]);
});

test('중복값이 있어도 올바르게 정렬한다', () => {
  assert.deepEqual(sortArray([3, 3, 1, 1, 2]), [1, 1, 2, 3, 3]);
});

test('원본 배열은 변경하지 않는다', () => {
  const original = [5, 3, 8, 1];
  const sorted = sortArray(original);

  assert.deepEqual(original, [5, 3, 8, 1]);
  assert.deepEqual(sorted, [1, 3, 5, 8]);
});
