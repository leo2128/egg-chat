'use strict';

/** @type Egg.EggPlugin */
const path = require('path');
exports.ua = {
  enable: true,
  path: path.join(__dirname, '../lib/plugin/egg-ua'),
};
/* 跨域 */
exports.cors = {
  enable: true,
  package: 'egg-cors',
};

/* mysql */
exports.mysql = {
  enable: true,
  package: 'egg-mysql',
};

/* websoket */
exports.io = {
  enable: true,
  package: 'egg-socket.io',
};
