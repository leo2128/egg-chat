'use strict';
module.exports = app => {
//   app.beforeStart(async () => {
//     const room = await app.redis.get('room:demo');
//     if (!room) {
//       await app.redis.set('room:demo', 'demo');
//     }
//   });
//   app.once('server', server => {
//     console.log(server, 'server');
//     // websocket
//   });
  //   app.on('error', (err, ctx) => {
  //     console.log(ctx, 'ctx');
  //     // throw err;
  //     // report error
  //   });
  //   app.on('request', ctx => {
  //     console.log(ctx);
  //     // log receive request
  //   });
  app.on('response', ctx => {
    // ctx.starttime is set by framework
    const used = Date.now() - ctx.starttime;
    app.logger.info(`HTTP请求返回使用了${used}ms`);
    // log total cost
  });
  // 在中间件最前面统计请求时间
  app.config.coreMiddleware.unshift('robot');
};
