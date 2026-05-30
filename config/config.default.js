/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
const path = require('path');
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  //   记日志
  config.logger = {
    level: 'DEBUG',
    allowDebugAtProd: true,
    dir: `${appInfo.baseDir}/logs/${appInfo.name}`,
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1573737371182_7713';

  // add your middleware config here
  config.middleware = [];

  config.static = {
    //   maxAge: 315
    prefix: '/public/',
    dir: path.join(appInfo.baseDir, 'app/public'),
  };

  config.news = {
    pageSize: 5,
    serverUrl: 'https://hacker-news.firebaseio.com/v0',
  };

  // 配置需要的中间件，数组顺序即为中间件的加载顺序
  config.middleware = [ 'gzip' ];

  // 配置 gzip 中间件的配置
  config.middleware.gzip = {
    threshold: 1024, // 小于 1k 的响应体不压缩
  };

  //   跨域
  config.proxy = true;

  config.mysql = {
    // 单数据库信息配置
    client: {
      // host
      host: '47.94.196.225',
      // 端口号
      port: '3306',
      // 用户名
      user: 'root',
      // 密码
      password: 'aBc123--',
      // 指定套接字文件路径
    //   socketPath: '/tmp/mysql.sock',
      // 数据库名
      database: 'chat',
    },
    // 是否加载到 app 上，默认开启
    app: true,
    // 是否加载到 agent 上，默认关闭
    agent: false,
  };

  // 跨域
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  //   post 请求 csrf token
  config.security = {
    csrf: {
      enable: false,
    },
  };

  // websoket io
  config.io = {
    init: { }, // passed to engine.io
    namespace: {
      '/': {
        // connectionMiddleware是在client保持连接的时候调用的中间件
        // 预处理器中间件, 我们这里配置了一个auth, 进行权限判断, 它对应的文件是/app/io/middleware/auth.js, 这里可以配置多个文件, 用逗号隔开
        connectionMiddleware: [ 'connection', 'auth' ],
        // packetMiddleware是在server发送包给client之后调用的中间件
        // 通常用于对消息做预处理，又或者是对加密消息的解密等操作
        packetMiddleware: [ 'packet' ],
      },
      '/chat': {
        connectionMiddleware: [ 'connection' ],
        packetMiddleware: [],
      },
    },
  };

  config.robot = {
    ua: [
      /curl/i,
      /Baiduspider/i,
    ],
  };

  return {
    ...config,
    ...userConfig,
  };
};
