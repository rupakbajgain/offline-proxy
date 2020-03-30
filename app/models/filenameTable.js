'use strict';

class FilenameTable {
  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file TEXT,
      url TEXT)`;
    return this.dao.run(sql);
  }

  create(file, url) {
    return this.dao.run(
      'INSERT INTO files (file, url) VALUES (?, ?)',
      [file, url]);
  }

  delete(id) {
    return this.dao.run(
      'DELETE FROM files WHERE id = ?',
      [id],
    );
  }

  deleteAll(){
    return this.dao.run(
      'DELETE FROM files',
      [],
    );
  }

  getById(id) {
    return this.dao.get(
      'SELECT * FROM files WHERE id = ?',
      [id]);
  }

  getAll() {
    return this.dao.all('SELECT * FROM files');
  }

  getFilename(url) {
    return this.dao.all(
      'SELECT file FROM files WHERE url = ?',
      [url]);
  }
}

module.exports = FilenameTable;
