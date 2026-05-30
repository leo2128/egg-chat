'use strict';
const Service = require('egg').Service;

class MsgsService extends Service {
  async getMsg(params) {
    //   群聊
    const { app } = this;
    let list = [];
    const { roomId } = params;
    const msgs = await app.mysql.select('message', {
      where: { room_id: roomId },
    });
    msgs ? list = msgs : 0;
    return list;
  }
  async sendMsgs(msg) {
    const { app } = this;
    console.log(msg, 2);
    const result = await app.mysql.insert('message',
      msg
    );
    let data = null;
    console.log(result);
    try {
      const status = result.protocol41;
      data = status ? { code: 10000, msg: '成功' } : 0;
    } catch (e) { throw e; }
    return data;
  }
  async getChatList(params) {
    //   私聊
    const { app } = this;
    let list = [];
    // 为以后做 私人聊天 做准备
    const { userId, toUserId } = params;
    // 获取 我发给你的消息
    const myMsgs = await app.mysql.select('message', {
      where: { from_user_id: userId, to_user_id: toUserId },
    });
    // 获取 你发给我的消息
    const youMsgs = await app.mysql.select('message', {
      where: { from_user_id: toUserId, to_user_id: userId },
    });
    // 合并数据 并按照时间排序
    list = myMsgs.concat(youMsgs);
    if (list.length) {
      list = list.sort((a, b) => {
        return a.msg_time - b.msg_time;
      });
    }
    return list;
  }
}

module.exports = MsgsService;
