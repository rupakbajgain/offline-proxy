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
}

module.exports = SiteTable;
