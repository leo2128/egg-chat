
'use strict';

const Controller = require('egg').Controller;

class RoomController extends Controller {
  async getRoom() {
    const { ctx } = this;
    // const userId = ctx.query.id;
    const roomName = ctx.query.roomName;
    const result = await ctx.service.rooms.getRooms(roomName);
    ctx.body = {
      code: 10000,
      message: result ? '成功' : '房间不存在',
      data: result,
    };
  }
  async setRoom() {
    const { ctx } = this;
    const roomInfo = ctx.request.body;
    console.log(roomInfo, '创建房间入参信息');
    const result = await ctx.service.rooms.setRoom(roomInfo);
    ctx.body = {
      code: result.message ? 10004 : 10000,
      message: result.message ? result.message : '创建成功',
      data: result,
    };
  }
  async getMembers() {
    const { ctx } = this;
    // const userId = ctx.query.id;
    const roomId = ctx.query.roomId;
    const userList = [];
    if (roomId) {
      const members = await ctx.service.rooms.getRoomMember(roomId);
      console.log('members');
      console.log(members);
      console.log('members');

      members.map(item => {
        userList.push({ userName: item.user_name, id: item.socket_id, userId: item.user_id, level: item.role_level });
        return item.user_name;
      });
    }
    ctx.body = {
      code: 10000,
      message: '成功',
      data: userList,
    };
  }
}
module.exports = RoomController;
// getRooms
