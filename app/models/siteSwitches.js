'use strict';
// Save sites globally in form of
// Site: disabled
// Site2: hidden
// For hosts.db

class SiteTable {
  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS site (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site TEXT,
      value TEXT)`;
    return this.dao.run(sql);
  }

  create(site, value) {
    return this.dao.run(
      'INSERT INTO site (site, value) VALUES (?, ?)',
      [site, value]);
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
      'SELECT value FROM site WHERE site = ?',
      [field]);
  }
}

module.exports = SiteTable;
