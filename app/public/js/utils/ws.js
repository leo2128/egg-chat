/* eslint-disable no-alert */
/* eslint-disable no-undef */
'use strict';
/**
 * author: yanqm
 * @param {boolean} cancelSocket:是否断开websocket，默认false
 * @param {str} socketIp: websocket的ip，默认后台调取
 * @param {str} wsUrl: websocket的链接，无默认值
 * @param {str} sockUrl: 不支持websocket时的链接，无默认值
 * @param {func} openSendMsg： 打开websocket的onopen时执行的方法
 * @param {func} sendMsg: 连接上后，onmessage中发送消息的方法，无默认值
 * @param {func} receiveMsg: 连接上后，onmessage中接收到消息的方法，无默认值
 * @param {boolean} heartBeat:是否打开心跳检测，默认true
 * @param {num} timeout: 心跳检测的间隔时间，默认10分钟
 */
(function($) {
  let originThis;
  let ws; // websocket实例
  let lockReconnect = false; // 避免重复连接
  let webSocketMsgIp = '';
  let wsUrl = '';
  let sockUrl = '';
  let getConnect = 0;
  let heartCheckObj;
  NewSocket.DEFAULTS = {
    cancelSocket: false,
    socketIp: null,
    wsUrl: null,
    sockUrl: null,
    openSendMsg: null,
    sendMsg: null,
    receiveMsg: null,
    heartBeat: true,
    timeout: 600000,
  };
  function NewSocket(options) {
    originThis = this;
    originThis.opts = $.extend({}, NewSocket.DEFAULTS, options);
    if (originThis.opts.cancelSocket) {
      originThis.cancelConnect();
      return;
    }
    originThis.connect();
    if (originThis.opts.heartBeat) {
      originThis.heartCheck();
    }
  }

  // 函数：websocket连接
  NewSocket.prototype.connect = function() {
    console.log('connect():连接中...');
    getConnect = 1;
    originThis.getIp();
    originThis.createWebSocket(wsUrl, sockUrl);
    lockReconnect = false;
  };
  // 函数：websocket断开连接，并且不再重连
  NewSocket.prototype.cancelConnect = function() {
    console.log('cancelConnect():断开连接');
    if (originThis.opts.heartBeat) {
      heartCheckObj.reset(); // 心跳检测重置
    }
    getConnect = 2;
    ws.close();
    lockReconnect = true;
  };
  // 函数：获取ip
  NewSocket.prototype.getIp = function() {
    // $.ajax({
    //   type: "GET",
    //   url: '/yunweiyun/hwxtBz/getFUQUrl.htm',
    //   dataType: "json",
    //   async: false,
    //   success: function (data) {
    //     webSocketMsgIp = originThis.opts.socketIp ? originThis.opts.socketIp : data.fuq_url;
    webSocketMsgIp = originThis.opts.socketIp ? originThis.opts.socketIp : '';
    wsUrl = 'ws://' + webSocketMsgIp + originThis.opts.wsUrl;
    sockUrl = webSocketMsgIp !== '' ? 'http://' + webSocketMsgIp + originThis.opts.sockUrl : '';
    // }
    // });
  };
  // 函数：获取url
  NewSocket.prototype.webSocketUrl = function(url, sUrl) {
    if ('WebSocket' in window) {
      websocket = new WebSocket(url);
    } else if ('MozWebSocket' in window) {
      websocket = new MozWebSocket(url);
    } else {
      $.getScript('//cdn.jsdelivr.net/sockjs/1.0.0/sockjs.min.js');
      websocket = new SockJS(sUrl);
    }
    console.log(websocket);
    return websocket;
  };
  // 函数：创建websocket
  NewSocket.prototype.createWebSocket = function(url, sUrl) {
    try {
      ws = sUrl !== '' ? originThis.webSocketUrl(url, sUrl) : originThis.webSocketUrl(url);
      console.log(ws, 'ws');
      originThis.initEventHandle();
    } catch (e) {
      originThis.reconnect(url, sUrl);
    }
  };
  // 函数：websocket相关操作,onopen、onmessage、onclose、onerror
  NewSocket.prototype.initEventHandle = function() {
    ws.onclose = function() {
      if (getConnect === 1) {
        originThis.reconnect(wsUrl, sockUrl);
        console.log('close():断开');
      }
    };
    ws.onerror = function() {
      if (getConnect === 1) {
        originThis.reconnect(wsUrl, sockUrl);
        console.log('error()：报错');
      }
    };
    ws.onopen = function() {
      if (originThis.opts.heartBeat) {
        heartCheckObj.reset().start(); // 心跳检测重置
      }
      if (ws.readyState === 1) {
        let msg = originThis.opts.openSendMsg();
        if (!msg) {
          const openTimeSpe = curTime();
          console.log('onopen()：连接成功，' + openTimeSpe);
          msg = '打开时间:' + openTimeSpe;
        }
        ws.send(msg);
      }
    };
    ws.onmessage = function(event) {
      if (originThis.opts.heartBeat) {
        heartCheckObj.reset().start(); // 拿到任何消息都说明当前连接是正常的
      }
      originThis.opts.sendMsg && originThis.opts.sendMsg(ws); // 发送消息
      originThis.opts.receiveMsg && originThis.opts.receiveMsg(event); // 接收消息
    };
  };
  // 函数：websocket重连
  NewSocket.prototype.reconnect = function(url, sUrl) {
    if (lockReconnect) return;
    lockReconnect = true;
    // 没连接上会一直重连，设置延迟避免请求过多
    setTimeout(function() {
      originThis.createWebSocket(url, sUrl);
      lockReconnect = false;
    }, 2000);
  };

  // 函数：心跳检测
  NewSocket.prototype.heartCheck = function() {
    heartCheckObj = {
      timeout: originThis.opts.timeout, // 发一次心跳的间隔时间
      timeoutObj: null,
      serverTimeoutObj: null,
      reset() {
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        return this;
      },
      start() {
        const self = this;
        this.timeoutObj = setTimeout(function() {
          // 这里发送一个心跳，后端收到后，返回一个心跳消息，onmessage拿到返回的心跳就说明连接正常
          if (ws.readyState === 1) {
            ws.send('HeartBeat');
          }
          // console.log("HeartBeat!" + curTime());
          self.serverTimeoutObj = setTimeout(function() {
            // 如果超过一定时间还没重置，说明后端主动断开了
            // 如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
            console.log('%c心跳检测:检测到websocket断开', 'color:#fff;background:#f00');
            ws.close();
          }, self.timeout);
        }, this.timeout);
      },
    };
  };

  // 函数：当前时间，年/月/日 时：分：秒
  function curTime() {
    const openTime = new Date();
    const openTimeSpe = openTime.getFullYear() + '/' + Number(Number(openTime.getMonth()) + 1) + '/' + openTime.getDate() + '，' + openTime.getHours() + ':' + openTime.getMinutes() + ':' + openTime.getSeconds();
    return openTimeSpe;
  }

  $.extend({
    newSocket(opts) {
      new NewSocket(opts);
    },
  });
})(jQuery);
