'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, io } = app;
  //   服务端 session
  //   router.get('/home', function() {
  //     this.session.angle = { name: 'my world' };
  //     this.body = '你好，请访问/public/index.html';
  //   });
  //   发送消息
  router.get('/msg', controller.home.index);
  //   用户
  router.get('/users/get/', controller.user.getInfo);
  router.post('/users/set/', controller.user.addInfo);
  router.get('/users/del', controller.user.delInfo);

  //   获取聊天室 聊天记录
  router.get('/msgList/', controller.msgList.getMsgList);
  //   房间
  router.post('/room/set', controller.rooms.setRoom);
  //   获取房间是否存在
  router.get('/getRoom/', controller.rooms.getRoom);
  //   房间成员列表
  router.get('/getMembers/', controller.rooms.getMembers);
  //   获取p2p聊天记录
  router.get('/msg/chatList', controller.msgList.getChatList);
  // app.io.of('/')
  //   io.route('chat', app.io.controller.chat.index);

  //   app.io.of('/');
  //   io.route('/', io.controller.chat.index);
  //   app.io.of('/chat');
  //   io.of('/chat').route('chat', app.io.controller.chat.index);
  //   io.of('/').route('server', io.controller.home.index);
  //   io.of('/').route('chat', io.controller.chat.index);
  //  聊天室 - 发送消息
  io.of('/').route('msg', io.controller.chat.message);
  //   p2p - 发送消息
  io.of('/').route('personMsg', io.controller.chat.personalMsg);
  //   聊天室 - 踢出成员
  io.of('/').route('delMember', io.controller.chat.delMember);
  //   io.of('/').route('user:online', io.controller.chat.online);
  io.of('/').route('exchange', io.controller.nsp.exchange);

};
