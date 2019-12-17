'use strict';

// const PREFIX = 'room';

module.exports = () => {
  return async (ctx, next) => {
    const { app, socket, logger, helper } = ctx;
    // 当 建立 socket 连接时， 触发
    const id = socket.id;
    const nsp = app.io.of('/');
    const query = socket.handshake.query;

    // 用户信息
    const { roomId, userId, userName } = query;
    logger.debug('#user_info', id, roomId, userId);

    // 踢出房间
    const tick = (id, msg) => {
      logger.debug('#tick', id, msg);

      // 踢出用户前发送消息
      socket.emit(id, helper.parseMsg('deny', msg));

    //   nsp.adapter 应该是redis的用法， 本篇使用的是 mysql
    //   调用 adapter 方法踢出用户，客户端触发 disconnect 事件
    //   nsp.adapter.remoteDisconnect(id, true, err => {
    //     logger.error(err);
    //   });
    };

    const getMemberList = members => {
      const userList = [];
      members.map(item => {
        userList.push({ userName: item.user_name, id: item.socket_id, level: item.role_level });
        return item.user_name;
      });
      return userList;
    };

    // 检查房间是否存在，不存在则踢出用户
    const hasRoom = await ctx.service.rooms.getRoomsById(roomId);

    logger.debug('#has_exist', hasRoom);

    if (!hasRoom) {
      tick(id, {
        type: 'deleted',
        message: 'deleted, room has been deleted.',
      });
      return;
    }

    // sql语句 添加 关联关系
    logger.debug('#join', roomId, userId);
    if (roomId && userId) {
      const params = {
        room_id: roomId,
        user_id: userId,
        user_name: userName,
        socket_id: id,
        role_level: 0,
      };
      //   加入之前 获取 该房间内 是否有人
      //   const beforeJoinMembers = await ctx.service.rooms.getRoomMember(roomId);
      //   console.log(beforeJoinMembers, 'beforeJoinMembers');
      //   if (!beforeJoinMembers.length) {
    //   console.log(userId, '刘晋阳 userId啊');
    //   console.log(hasRoom.room_master, '房主 userId啊');
      if (userId === hasRoom.room_master) {
        params.role_level = 2;
      }
      const joinResult = await ctx.service.rooms.addRoomUser(params);

      logger.debug(joinResult, '添加关联关系');
      try {
        const members = await ctx.service.rooms.getRoomMember(roomId);
        // console.log(members, 'members  => members join');
        //   加入之后，获取 更新人员列表数据
        const userList = getMemberList(members);
        nsp.to(roomId).emit('online', {
          userList,
          action: 'join',
          target: 'participator',
          message: '有新成员加入聊天室',
        });
        // console.log(userList, 'members  => members join');
      } catch (error) { throw error; }
      socket.join(roomId);
    }

    await next();

    // 用户离开
    // 用户离开 更新在线列表
    logger.debug('#leave', roomId);
    console.log('#leave', userId);
    if (userId) {
      const delMemeber = ctx.service.rooms.delRoomUser(userId);
    //   console.log(delMemeber, '清除关联关系');
      try {
        const members = await ctx.service.rooms.getRoomMember(roomId);
        //   获取人员列表数据
        const userList = getMemberList(members);
        nsp.to(roomId).emit('terrible', {
          userList,
          action: 'leave',
          target: 'participator',
          message: '有成员离开了',
        });
        // console.log(userList, 'members  => members leave');
      } catch (error) { throw error; }

    }


  };
};
