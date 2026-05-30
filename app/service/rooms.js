'use strict';
const Service = require('egg').Service;

class RoomService extends Service {
  // 获取房间 根据名称
  async getRooms(room_name) {
    // 假如 我们拿到用户 id 从数据库获取用户详细信息
    const { app } = this;
    let result = {};
    try {
      result = await app.mysql.get('rooms', { room_name });
    } catch (error) {
      console.log(error);
    }
    return result;
  }
//   获取房间列表
  async getRoomList() {
    // 假如 我们拿到用户 id 从数据库获取用户详细信息
    const { app } = this;
    let result = {};
    try {
    result = await app.mysql.select('rooms');
    } catch (error) {
    console.log(error);
    }
    return result;
  }
  async getRoomsById(room_id) {
    // 假如 我们拿到用户 id 从数据库获取用户详细信息
    const { app } = this;
    let result = {};
    try {
      result = await await app.mysql.get('rooms', { room_id });
    } catch (error) {
      console.log(error);
    }
    return result;
  }

  async setRoom(param) {
    const { app, ctx } = this;
    const room_name = param.roomName;
    const room_master = param.roomMaster;
    const isRoom = await ctx.service.rooms.getRooms({ room_name });
    let data = {};
    if (!isRoom) {
      const result = await app.mysql.insert('rooms', {
        room_name,
        room_master,
      }
      );
      console.log(result, '创建房间结果');
      try {
        const id = result.insertId;
        data = { id, roomName: room_name };
      } catch (e) { throw e; }
    } else {
      data = { message: '房间已存在' };
    }
    return data;
  }
  //   查询聊天室内成员列表奥
  async getRoomMember(room_id) {
    // 假如 我们拿到用户 id 从数据库获取用户详细信息
    const { app } = this;
    let result = {};
    try {
      result = await app.mysql.select('rooms_users_merge', {
        where: { room_id },
      });
    } catch (error) {
      console.log(error);
    }
    return result;
  }
  //   关联表 查询用户是否存在
  async isRoomUser(user_id) {
    const { app } = this;
    const result = await app.mysql.get('rooms_users_merge', { user_id });
    return result;
  }
  // 关联表 绑定用户和房间信息
  async addRoomUser(roomInfo) {
    const { app, ctx } = this;
    let data = {};
    let result = {};
    if (roomInfo.user_id) {
        let user_id = roomInfo.user_id
      const isUserHave = await ctx.service.rooms.isRoomUser(roomInfo.user_id);
      if (!isUserHave) {
        result = await app.mysql.insert('rooms_users_merge',
          roomInfo
        );
      } else {
        const delResult = await app.mysql.delete('rooms_users_merge', {
            user_id,
        });
        if (delResult) {
            result = await app.mysql.insert('rooms_users_merge',
                roomInfo
            );
        }
        data = isUserHave;
      }
      if (result) {
        data = await ctx.service.rooms.isRoomUser(roomInfo.user_id);
      }
    }
    return data;
  }
  // 关联表 解除用户和房间关系
  async delRoomUser(user_id, name) {
    const { app } = this;
    const result = await app.mysql.delete('rooms_users_merge', {
      user_id,
    });
    let data = {};
    try {
      result ? data = { id: user_id, message: `${name} 已被踢出聊天室` } : 0;
    } catch (e) { throw e; }
    return data;
  }
}
module.exports = RoomService
;
