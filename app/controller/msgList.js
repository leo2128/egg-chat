'use strict';

const Controller = require('egg').Controller;
class MsgListController extends Controller {
  async getMsgList() {
    const { ctx } = this;
    const roomId = ctx.query.roomId;
    const list = await ctx.service.msgs.getMsg({ roomId });
    ctx.body = {
      code: 10000,
      message: '成功',
      data: list,
    };
  }
  async getChatList() {
    const { ctx } = this;
    const { userId, toUserId } = ctx.query;
    const list = await ctx.service.msgs.getChatList({ userId, toUserId });
    ctx.body = {
      code: 10000,
      message: '成功',
      data: list,
    };
  }
}
module.exports = MsgListController;
