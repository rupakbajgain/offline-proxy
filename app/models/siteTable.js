'use strict';

class SiteTable {
  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS site (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      field TEXT,
      value TEXT)`;
    return this.dao.run(sql);
  }

  create(field, value) {
    return this.dao.run(
      'INSERT INTO site (field, value) VALUES (?, ?)',
      [field, value]);
  }

  delete(id) {
    return this.dao.run(
      'DELETE FROM site WHERE id = ?',
      [id],
    );
  }

  getById(id) {
    return this.dao.get(
      'SELECT * FROM site WHERE id = ?',
      [id]);
  }

  getAll() {
    return this.dao.all('SELECT * FROM site');
  }

  getValue(field) {
    return this.dao.get(
      'SELECT value FROM site WHERE field = ?',
      [field]);
  }

  update(field, value) {
    return this.dao.run(
      'UPDATE site SET value = ? WHERE field = ?',
      [value, field]);
  }
}

module.exports = SiteTable;
