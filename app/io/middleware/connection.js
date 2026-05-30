'use strict';
module.exports = () => {
  return async (ctx, next) => {
    const { app } = ctx;
    // const nsp = app.io.of('/');
    // nsp.emit('online', '有新成员加入聊天室了');
    // await next();
    // if (ctx) {
    //   ctx.socket.disconnect();
    //   return;
    // }
    await next();
  };
};
