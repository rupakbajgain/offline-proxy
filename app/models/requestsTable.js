'use strict';

class RequestsTable {
  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userdefined BOOLEAN,
      url TEXT)`;
    return this.dao.run(sql);
  }

  create(url, userdefined) {
    return this.dao.run(
      'INSERT INTO requests (userdefined, url) VALUES (?, ?)',
      [userdefined, url]);
  }

  delete(id) {
    return this.dao.run(
      'DELETE FROM requests WHERE id = ?',
      [id],
    );
  }

  deleteAll(){
    return this.dao.run(
      'DELETE FROM requests',
      [],
    );
  }

  deleteUrl(url) {
    return this.dao.run(
      'DELETE FROM requests WHERE url = ?',
      [url],
    );
  }

  getById(id) {
    return this.dao.get(
      'SELECT * FROM requests WHERE id = ?',
      [id]);
  }

  getByUrl(url) {
    return this.dao.get(
      'SELECT * FROM requests WHERE url = ?',
      [url]);
  }


  getAll() {
    return this.dao.all('SELECT * FROM requests');
  }

  setUserRequest(id){
    return this.dao.run(
      'UPDATE requests SET userdefined = true WHERE id = ?',
      [id]);
  }
}

module.exports = RequestsTable;
