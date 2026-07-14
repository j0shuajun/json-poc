import { loadContacts, saveContacts } from './storage.js';
import { createContact, findById, search, updateContact, deleteContact } from './contactStore.js';

const MENU_TEXT = `
===== 연락처 관리 =====
1. 전체 목록 보기
2. ID로 검색
3. 키워드로 검색
4. 새 연락처 추가
5. 연락처 수정
6. 연락처 삭제
0. 종료
========================`;

export function formatContact(contact) {
  return `[${contact.id}] ${contact.name} | ${contact.phone} | ${contact.email}`;
}

function printContacts(contacts, log) {
  if (contacts.length === 0) {
    log('등록된 연락처가 없습니다.');
    return;
  }
  contacts.forEach((contact) => log(formatContact(contact)));
}

async function handleCreate(contacts, rl, log) {
  const name = (await rl.question('이름 > ')).trim();
  const phone = (await rl.question('전화번호 > ')).trim();
  const email = (await rl.question('이메일 > ')).trim();

  try {
    const { contacts: next, contact } = createContact(contacts, { name, phone, email });
    log(`추가되었습니다: ${formatContact(contact)}`);
    return next;
  } catch (err) {
    log(`ERROR :: ${err.message}`);
    return contacts;
  }
}

async function handleFindById(contacts, rl, log) {
  const id = Number((await rl.question('찾을 ID > ')).trim());
  const found = findById(contacts, id);
  log(found ? formatContact(found) : '해당 ID의 연락처를 찾을 수 없습니다.');
}

async function handleSearch(contacts, rl, log) {
  const keyword = (await rl.question('검색어 > ')).trim();
  const results = search(contacts, keyword);
  if (results.length === 0) {
    log('일치하는 연락처가 없습니다.');
    return;
  }
  results.forEach((contact) => log(formatContact(contact)));
}

async function handleUpdate(contacts, rl, log) {
  const id = Number((await rl.question('수정할 ID > ')).trim());
  const target = findById(contacts, id);
  if (!target) {
    log('해당 ID의 연락처를 찾을 수 없습니다.');
    return contacts;
  }

  log(`현재 값: ${formatContact(target)}`);
  const name = (await rl.question(`이름 (${target.name}, 그대로 두려면 Enter) > `)).trim();
  const phone = (await rl.question(`전화번호 (${target.phone}, 그대로 두려면 Enter) > `)).trim();
  const email = (await rl.question(`이메일 (${target.email}, 그대로 두려면 Enter) > `)).trim();

  const fields = {};
  if (name) fields.name = name;
  if (phone) fields.phone = phone;
  if (email) fields.email = email;

  const next = updateContact(contacts, id, fields);
  log(`수정되었습니다: ${formatContact(findById(next, id))}`);
  return next;
}

async function handleDelete(contacts, rl, log) {
  const id = Number((await rl.question('삭제할 ID > ')).trim());
  const target = findById(contacts, id);
  if (!target) {
    log('해당 ID의 연락처를 찾을 수 없습니다.');
    return contacts;
  }

  const confirmation = (
    await rl.question(`정말 삭제할까요? (${formatContact(target)}) y/n > `)
  ).trim().toLowerCase();

  if (confirmation !== 'y') {
    log('삭제를 취소했습니다.');
    return contacts;
  }

  const next = deleteContact(contacts, id);
  log('삭제되었습니다.');
  return next;
}

export async function main({ rl, filePath, log = console.log }) {
  let contacts = loadContacts(filePath);

  while (true) {
    log(MENU_TEXT);
    const choice = (await rl.question('선택 > ')).trim();

    if (choice === '0') {
      log('프로그램을 종료합니다.');
      break;
    } else if (choice === '1') {
      printContacts(contacts, log);
    } else if (choice === '2') {
      await handleFindById(contacts, rl, log);
    } else if (choice === '3') {
      await handleSearch(contacts, rl, log);
    } else if (choice === '4') {
      contacts = await handleCreate(contacts, rl, log);
      saveContacts(filePath, contacts);
    } else if (choice === '5') {
      contacts = await handleUpdate(contacts, rl, log);
      saveContacts(filePath, contacts);
    } else if (choice === '6') {
      contacts = await handleDelete(contacts, rl, log);
      saveContacts(filePath, contacts);
    } else {
      log('ERROR :: 올바른 메뉴 번호를 입력하세요.');
    }
  }
}
