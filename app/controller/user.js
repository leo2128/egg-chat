
'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  async getInfo() {
    const { ctx } = this;
    // const userId = ctx.query.id;
    const userName = ctx.query.name;
    // const user = await ctx.service.user.find(userId);
    const user = await ctx.service.user.find(userName);
    if (user.user) {
      ctx.body = {
        code: 10000,
        message: '成功',
        data: user.user,
      };
    } else {
      ctx.body = {
        code: 10004,
        message: '未查询到该用户',
        data: null,
      };
    }
  }
  async addInfo() {
    const { ctx, service } = this;
    const user = ctx.request.body;
    const result = await service.user.addInfo(user);
    // console.log(result);
    // this.ctx.body = result;
    if (result.id) {
      this.ctx.body = {
        code: 10000,
        data: result,
      };
    } else {
      this.ctx.body = {
        code: 10004,
        data: '用户添加失败',
      };
    }
  }
  async delInfo() {
    const { ctx, service } = this;
    const id = ctx.query.id;
    const result = await service.user.delInfo(id);
    this.ctx.body = {
      code: 10000,
      data: result,
    };
  }
}

module.exports = UserController;
