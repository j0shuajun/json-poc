import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createContact, findById, search, updateContact, deleteContact } from '../../app/contactStore.js';

test('createContact는 id를 자동으로 매겨 새 연락처를 추가한다', () => {
  const { contacts, contact } = createContact([], {
    name: '홍길동',
    phone: '010-1234-5678',
    email: 'hong@example.com',
  });

  assert.equal(contact.id, 1);
  assert.deepEqual(contacts, [
    { id: 1, name: '홍길동', phone: '010-1234-5678', email: 'hong@example.com' },
  ]);
});

test('createContact는 기존 최대 id 다음 번호를 매긴다', () => {
  const existing = [{ id: 5, name: '기존', phone: '', email: '' }];

  const { contact } = createContact(existing, { name: '신규' });

  assert.equal(contact.id, 6);
});

test('createContact는 name이 없으면 에러를 던진다', () => {
  assert.throws(() => createContact([], { name: '' }));
});

test('createContact는 phone/email을 생략하면 빈 문자열로 채운다', () => {
  const { contact } = createContact([], { name: '홍길동' });

  assert.equal(contact.phone, '');
  assert.equal(contact.email, '');
});

test('createContact는 name이 공백 문자로만 이루어져 있으면 에러를 던진다', () => {
  assert.throws(() => createContact([], { name: '   ' }), /name is required/);
});

test('createContact는 name이 문자열이 아니면(숫자 등) name is required 에러를 던진다', () => {
  assert.throws(() => createContact([], { name: 123 }), /name is required/);
});

test('findById는 id가 일치하는 연락처를 돌려준다', () => {
  const contacts = [
    { id: 1, name: '홍길동', phone: '', email: '' },
    { id: 2, name: '김철수', phone: '', email: '' },
  ];

  assert.deepEqual(findById(contacts, 2), { id: 2, name: '김철수', phone: '', email: '' });
});

test('findById는 일치하는 연락처가 없으면 undefined를 돌려준다', () => {
  assert.equal(findById([], 1), undefined);
});

test('findById는 id 타입이 다르면(문자열 "1" vs 숫자 1) 같은 것으로 취급하지 않는다', () => {
  const contacts = [{ id: 1, name: '홍길동', phone: '', email: '' }];

  assert.equal(findById(contacts, '1'), undefined);
});

test('search는 이름/전화/이메일 중 하나라도 키워드를 포함하면 찾는다', () => {
  const contacts = [
    { id: 1, name: '홍길동', phone: '010-1111-2222', email: 'hong@example.com' },
    { id: 2, name: '김철수', phone: '010-3333-4444', email: 'kim@example.com' },
  ];

  assert.deepEqual(search(contacts, '홍'), [contacts[0]]);
  assert.deepEqual(search(contacts, '3333'), [contacts[1]]);
});

test('search는 대소문자를 구분하지 않는다', () => {
  const contacts = [{ id: 1, name: 'Hong', phone: '', email: 'HONG@example.com' }];

  assert.deepEqual(search(contacts, 'hong@example'), contacts);
});

test('search는 keyword가 문자열이 아니면(숫자 등) 명확한 TypeError를 던진다', () => {
  const contacts = [{ id: 1, name: '홍길동', phone: '', email: '' }];

  assert.throws(() => search(contacts, 123), /keyword must be a string/);
});

test('updateContact는 지정한 필드만 바꾼 새 배열을 돌려준다', () => {
  const contacts = [{ id: 1, name: '홍길동', phone: '010-1111-2222', email: 'hong@example.com' }];

  const updated = updateContact(contacts, 1, { phone: '010-9999-0000' });

  assert.deepEqual(updated, [
    { id: 1, name: '홍길동', phone: '010-9999-0000', email: 'hong@example.com' },
  ]);
  assert.deepEqual(contacts[0].phone, '010-1111-2222', '원본 배열은 변경되지 않아야 한다');
});

test('updateContact는 대상 id가 없으면 에러를 던진다', () => {
  assert.throws(() => updateContact([], 999, { name: 'x' }));
});

test('updateContact에 빈 필드 객체를 전달하면 기존 값을 그대로 유지한다', () => {
  const contacts = [{ id: 1, name: '홍길동', phone: '010-1111-2222', email: 'hong@example.com' }];

  const updated = updateContact(contacts, 1, {});

  assert.deepEqual(updated, contacts);
});

test('deleteContact는 대상을 제외한 새 배열을 돌려준다', () => {
  const contacts = [
    { id: 1, name: '홍길동', phone: '', email: '' },
    { id: 2, name: '김철수', phone: '', email: '' },
  ];

  const remaining = deleteContact(contacts, 1);

  assert.deepEqual(remaining, [{ id: 2, name: '김철수', phone: '', email: '' }]);
  assert.equal(contacts.length, 2, '원본 배열은 변경되지 않아야 한다');
});

test('deleteContact는 대상 id가 없으면 에러를 던지고 아무것도 지우지 않는다', () => {
  const contacts = [{ id: 1, name: '홍길동', phone: '', email: '' }];

  assert.throws(() => deleteContact(contacts, 999));
  assert.equal(contacts.length, 1);
});

test('deleteContact는 id 타입이 다르면(문자열 "1" vs 숫자 1) 찾지 못해 에러를 던진다', () => {
  const contacts = [{ id: 1, name: '홍길동', phone: '', email: '' }];

  assert.throws(() => deleteContact(contacts, '1'), /Contact not found: id=1/);
  assert.equal(contacts.length, 1);
});
