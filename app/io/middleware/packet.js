'use strict';
// const room = 'default_room';
module.exports = () => {
  return async (ctx, next) => {
    const { socket } = ctx;
    // const id = socket.id;
    const query = socket.handshake.query;
    console.log('监听建立socket连接时传递参数', query);
    // console.log('packet', ctx.packet);
    // socket.join(room);
    await next();
  };
};
