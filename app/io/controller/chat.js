'use strict';

// const Controller = require('egg').Controller;

// const room = 'default_room';

// class ChatController extends Controller {
//   async index() {
//     const { app, socket } = this.ctx;
//     // , logger, helper
//     const id = socket.id;
//     const nsp = app.io.of('/chat');
//     // 根据id给指定连接发送消息
//     nsp.sockets[id].emit('res', 'hello ....');
//     // 指定房间连接信息列表
//     nsp.adapter.clients([ room ], (err, clients) => {
//       console.log(JSON.stringify(clients));
//     });
//     //  给指定房间的每个人发送消息
//     this.ctx.app.io.of('/').to(room).emit('online', this.ctx.socket.id + '上线了');
//     // 断开连接
//     this.ctx.socket.disconnect();
//   }
// }
// module.exports = ChatController;

module.exports = app => {
  class Controller extends app.Controller {
    async index() {
      this.ctx.socket.emit('res', 'test');
    }
    // 公聊
    async message() { // 方法通过 客户端 this.emit（'message',{}）//触发
      const params = this.ctx.args[0];
      //   数据库存储消息
      const data = await this.service.msgs.sendMsgs(params);
      //   console.log(data, 'send_data');
      //   广播通知每个用户消息
      data ? app.io.of('/').emit('receiveMsg', JSON.stringify(params)) : 0;
    }
    // 私聊
    async personalMsg() { // 方法通过 客户端 this.emit（'personalMsg',{}）//触发
      const params = this.ctx.args[0];
      //   数据库存储消息
      const data = await this.service.msgs.sendMsgs(params);
      //   console.log(data, 'send_data');
      //   广播通知每个用户消息
      data ? app.io.of('/').emit('personMsg', JSON.stringify(params)) : 0;
    }
    // 上线通知
    async online() { // 上线提醒
      this.ctx.socket.emit('msg', '有人上线了');
    }
    // 踢出成员
    async delMember() {
      const params = this.ctx.args[0];
      console.log(params, '删除成员');
      const data = await this.service.rooms.delRoomUser(params.id, params.name);
      console.log(data, '删除成员返回值');
      data ? app.io.of('/').emit('terrible', data) : 0;
    }
  }
  return Controller;
};
