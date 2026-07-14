function nextId(contacts) {
  if (contacts.length === 0) {
    return 1;
  }
  return Math.max(...contacts.map((contact) => contact.id)) + 1;
}

export function createContact(contacts, { name, phone = '', email = '' }) {
  if (typeof name !== 'string' || !name.trim()) {
    throw new Error('name is required');
  }

  const contact = { id: nextId(contacts), name, phone, email };
  return { contacts: [...contacts, contact], contact };
}

export function findById(contacts, id) {
  return contacts.find((contact) => contact.id === id);
}

export function search(contacts, keyword) {
  if (typeof keyword !== 'string') {
    throw new TypeError('keyword must be a string');
  }
  const lowerKeyword = keyword.toLowerCase();
  return contacts.filter((contact) =>
    [contact.name, contact.phone, contact.email].some((value) =>
      (value ?? '').toLowerCase().includes(lowerKeyword)
    )
  );
}

export function updateContact(contacts, id, fields) {
  const index = contacts.findIndex((contact) => contact.id === id);
  if (index === -1) {
    throw new Error(`Contact not found: id=${id}`);
  }

  const next = [...contacts];
  next[index] = { ...contacts[index], ...fields, id };
  return next;
}

export function deleteContact(contacts, id) {
  const index = contacts.findIndex((contact) => contact.id === id);
  if (index === -1) {
    throw new Error(`Contact not found: id=${id}`);
  }

  return contacts.filter((contact) => contact.id !== id);
}
