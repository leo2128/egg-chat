'use strict';
const moment = require('moment');
exports.relativeTime = time => moment(new Date(time * 1000)).fromNow();

module.exports = {
  parseMsg(action, payload = {}, metadata = {}) {
    const meta = Object.assign({}, {
      timestamp: Date.now(),
    }, metadata);

    return {
      meta,
      data: {
        action,
        payload,
      },
    };
  },
};
