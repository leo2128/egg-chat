'use strict';
const Service = require('egg').Service;

class UserService extends Service {
//   async find(uid) {
  async find(uName) {
    // 假如 我们拿到用户 id 从数据库获取用户详细信息
    const { app } = this;
    // get 查询单条数据  select 查询多条数据
    // const user = uid ? await app.mysql.get('users', { id: uid }) : await app.mysql.select('users');
    const user = uName ? await app.mysql.get('users', { name: uName }) : await app.mysql.select('users');
    // console.log(user);
    return { user };
  }
  async findId(uid) {
    // 假如 我们拿到用户 id 从数据库获取用户详细信息
    const { app } = this;
    // get 查询单条数据  select 查询多条数据
    console.log('user +   ' + uid);
    const user = uid ? await app.mysql.get('users', { id: uid }) : 0;
    // console.log(user);
    return { user };
  }
  async addInfo(user) {
    const { app } = this;
    const result = await app.mysql.insert('users',
      user
    );
    let data = {};
    try {
      const id = result.insertId;
      data = { id };
    } catch (e) { throw e; }
    return data;
  }
  async delInfo(id) {
    const { app } = this;
    const result = await app.mysql.delete('users', {
      id,
    });
    let data = {};
    try {
      const id = result.insertId;
      data = { id };
    } catch (e) { throw e; }
    return data;
  }
}

module.exports = UserService;
