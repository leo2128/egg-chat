$(function() {
    var $chat = $('#chat-wrap');
    var $notice = $('#notice');
    var $set = $('#send');
    var $sub = $('#sub');
    var $confirm = $('#confirm');
    var $load = $('#load');
    var $actionTxt = $('.action-txt');
    var $userWrap = $('.user-wrap');
    var $chatWrap = $('.chat-wrap');
    var $search = $('#search');
    var $del = $('.del')
    var $close = $('.close');
    var $closeRoom = $('.close-room');
    var $onmessage = $('.online-message');
    var $errormessage = $('.error-message');
    var $chatTitle = $('#chat-name')

    var list = [];
    var roomList = [];
    var userName = '';
    var userId = null;
    var roomId = null;
    var socket = null;
    let ip = window.location.host;
    let common_ip = 'http://' + ip;

    // 点击成员 私聊
    personalChat();
    // 进入房间 点击事件
    joinBtn();
    // 创建房间 点击事件
    creatBtn();
    // 登录
    loadInput();
    // 是否已登录
    isLoadJoin();

    // 创建房间 点击事件
    function creatBtn() {
        $(document).on('click', '#creat', function(){
            if (!userId) {
                alert('请先登录')
            } else {
                creatRoomDialog();
            }
        })
        
        $(document).on('click', '#confirm', function(){
            creatRoom();
        })
    }

    // 创建房间 弹窗展示
    function creatRoomDialog() {
        $chatWrap.show();
    }

    // 创建房间 调取接口
    function creatRoom() {
        let cRoomName = Trim($('#room-name').val())
        if(!cRoomName) {
            alert('请输入你要创建的房间名称')
        } else {
            let params = { roomName: cRoomName, roomMaster: userId }
            $.ajax({
            type: 'POST',
            url: common_ip + '/room/set',
            contentType: 'application/json',
            data: JSON.stringify(params),
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': getCookie('csrfToken')
            },
            success: (res) => {
                if (res.code === 10000) {
                    let { id, roomName } = res.data
                    $chatTitle.html(roomName)
                    sessionStorage.setItem('roomInfo', JSON.stringify({ roomId: id, roomName }))
                    isLoadJoin();
                    $chatWrap.hide();
                    clearInput();
                    alert('创建成功!')
                } else {
                    alert('房间已存在，请输入别的房间名称')
                }
            },
            error: (error) => {
                console.log(error)
            }
        })
        }
    }

    // 加入房间 事件集合
    function joinBtn() {
        // 加入房间 弹窗出现
        $(document).on('click', '#join', function(){
            joinRoom()
        })

        // 创建房间 close
        $(document).on('click', '.close-room', function() {
            $chatWrap.hide()
        })

        // 选择房间 close
        $(document).on('click', '.close-room-s', function() {
            $('.room-wrap').hide()
        })
        
        // 选择 房间名称
        $(document).on('change', '#room-select', function() {
            roomId = +$(this).val()
        })

        // 进入房间
        $(document).on('click', '#sub-join', function() {
            let selectObj =  roomList.filter(item => {
                return roomId === item.room_id
            })
            roomName = selectObj[0].room_name
            $chatTitle.html(roomName)
            sessionStorage.setItem('roomInfo', JSON.stringify({ roomId, roomName }))
            isLoadJoin();
            $('.room-wrap').hide()
        })
    }

    // 获取房间列表 打开弹窗
    function joinRoom() {
        $.get('/room/list', function(res) {
            if (res.code === 10000) {
                roomList = res.data
                roomId = roomList[0].room_id
                roomName = roomList[0].room_name
                var str = ``;
                roomList.map(item => {
                    str += `<option value="${item.room_id}">${item.room_name}</option>`
                })
                $('#room-select').html(str)
                $('.room-wrap').show()
            }
        })
    }
    // 获取房间人员列表
    function getMembers(roomId) {
        $.get('/getMembers', { roomId }, res => {
            if (res.code === 10000) {
                let list = res.data
                let info = JSON.parse(sessionStorage.getItem('info'))
                if(info && list.length) {
                    let myInfo = list.filter(item => {
                        return item.userId == info.userId ? item : 0
                    })
                    let myLevel = myInfo[0].level
                    renderRoomMember(list, myLevel, info)
                } else {
                    renderRoomMember(list)
                }
            }
        })
    }
    
    // socket 长连接
    function connection() {
        // 建立连接
        socket.on('connect', function(data) {
            console.log('连接成功');
            setTimeout(function(){
                // 获取成员列表
                getMembers(roomId)
            }, 500)
        })
        // 连接失败重新连接
        socket.on('connect_failed', function(data) {
            console.log('连接失败', data);
        })
        // 接收在线用户信息
        socket.on('online', data => {
            // 当其他用户上线时， 触发
            getMembers(roomId)
            onlineMessage(data.message);
        });

        // 监听服务器推送数据
        socket.on('receiveMsg',function(data){
            list.push(JSON.parse(data))
            renderHtml(list);
        });
        
        //监听socket断开与重连。
        socket.on('disconnect', function() {
            errormessage('与服务断器开')
        });
        socket.on('reconnect', function() {
            errormessage('重新连接到服务器')
        });
        // 假值信息
        socket.on('terrible', (data) => {
            var info = JSON.parse(sessionStorage.getItem('info'))
            if (info.userId == data.id) {
                errormessage(`您已被踢出房间`)
                setTimeout(function(){
                    sessionStorage.removeItem('info')
                    delete userId
                    delete userName
                    getMembers(roomId)
                    getMsgList()
                    isIfLogin()
                }, 800)
            } else {
                errormessage(data.message)
                getMembers(roomId)
            }
        });
    }

    window.socket = socket;
    // 上线提示消息
    function onlineMessage(msg) {
        $onmessage.html(msg);
        $onmessage.fadeIn(1000);
        setTimeout(function() {
            $onmessage.fadeOut(1000)
        }, 2000)
    }

    // 失败消息提醒
    function errormessage(msg) {
        $errormessage.html(msg);
        $errormessage.fadeIn(1000);
        setTimeout(function() {
            $errormessage.fadeOut(1000)
        }, 2000)
    }

    function removeAllSpace(str) {
        // return str.replace(/\s+/g, "");
        return str.trim();
    }

    // 消息列表渲染
    function renderHtml (list) {
        let html = ``;
        list.map(item => {
            html += `<div  class="msg-cont clear ${item.form_user_id == userId ? 'me-cont' : 'you-cont'}">
                        <div class="${item.from_user_id == userId ? 'me' : 'you'}">
                            <div class="user_name">${item.from_user_name}</div>
                            <div class="user_tim">${dateFtt(item.msg_time)}</div>
                            <div class="chat-msg">${item.msg}</div>
                        </div>
                    </div>`
        })
        $chat.html(html)
    }

    function dateFtt(timestamp) { //author: meizz 
        var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var Y = date.getFullYear() + '-';
        var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
        var D = date.getDate() < 10 ?  '0'+date.getDate()+ ' ' : date.getDate()+ ' ';
        var h = date.getHours() < 10 ? '0'+date.getHours()+ ':' : date.getHours()+ ':';
        var m = date.getMinutes() < 10 ? '0'+date.getMinutes()+ ':' : date.getMinutes()+ ':';
        var s = date.getSeconds()< 10 ? '0'+date.getSeconds() : date.getSeconds();
        return Y+M+D+h+m+s;
    }

    function loadInput() {
        // 注册
        $set.on('click', function() {
            $actionTxt.html('注册');
            $('.user-wrap').show();
        })
        // 登录
        $load.on('click', function() {
            $actionTxt.html('登录');
            $('.user-wrap').show();
        })
        // 提交
        $sub.on('click', function(e) {
            e.preventDefault();
            userName = $('#name').val();
            if ($actionTxt.html() == '注册') {
                var params = {
                    name: userName
                }
                addInfo(params)
            } else {
                getUserInfo(userName)
            }
        })
        // 关闭
        $close.on('click', function(){
            $userWrap.hide();
            clearInput();
        })
    }
    // 发送消息
    $('#post').on('click', () => {
        emitMessage()
    })
    // 回车事件
    $('#notice').on('keypress', (ev) => {
        if(ev.keyCode == 13) {
            emitMessage()
        }
    })
    function emitMessage() {
        let msg = removeAllSpace($('#notice').val());
        let tim = new Date().getTime();
        if (!userName) {
            alert('请先登录')
        } else if (!roomId) {
            alert('请先加入房间')
        } else {
            if(msg) {
                let params = { msg: msg, msg_time: tim, from_user_name: userName, from_user_id: userId, room_id: roomId}
                socket.emit('msg', params); //向服务器发送消息
                $notice.val('')
            }
        }
    }
    // 点击成员列表 私聊开始
    function personalChat() {
        $(document).on('click', '#members li', function(e){
            if (!sessionStorage.getItem('info')) {
                alert('请先登录！')
                return;
            } else {
                const $target = $(e.target)
                let id = $target.data('id')
                let uid = $target.data('uid')
                let infoName = Trim(JSON.parse(sessionStorage.getItem('info')).userName)
                let curentTxt = Trim($target[0].firstChild.nodeValue)
                if (curentTxt == infoName) {
                    return
                }
                // 点击 x 将成员踢出聊天室
                if ($target.hasClass('del')) {
                    uid = $target.parent().data('uid')
                    userName = Trim($target.parent()[0].firstChild.nodeValue)
                    let params = { id: uid, name: userName  }
                    // 触发 踢出成员 方法
                    socket.emit('delMember', params);
                    return;
                }
                if ($target.hasClass('set-manager') || $target.hasClass('master') || $target.hasClass('list-me')) {
                    // 设置 管理员
                    return;
                }
                var params = { to_userId: uid, to_userName: curentTxt }
                // 跳转页面  问题： 1.无法让对方得知有人找他私聊 
                window.open(`./page/personal.html?id=${id}&session=${compileStr(JSON.stringify(params))}`)
                // 不跳转页面 在当前聊天室内 私聊 只有彼此双方可以看到消息  问题： 1. 和房间没有解耦  
            }
        })
    }
    // 加密字符串
    function compileStr(code){
        var c=String.fromCharCode(code.charCodeAt(0)+code.length);  
        for(var i=1;i<code.length;i++){        
            c+=String.fromCharCode(code.charCodeAt(i)+code.charCodeAt(i-1));  
        }     
        return escape(c);
    }
    // 注册用户信息
    function addInfo(params) {
        $.ajax({
            type: 'POST',
            url: common_ip + '/users/set',
            contentType: 'application/json',
            data: JSON.stringify(params),
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': getCookie('csrfToken')
            },
            success: (res) => {
                if (res.code === 10000) {
                    $userWrap.hide();
                    clearInput();
                    userName = params.name
                    userId = res.data.id
                    sessionStorage.setItem('info', JSON.stringify({ userId, userName }))
                    isLoadJoin();
                }
            },
            error: (error) => {
                console.log(error)
            }
        })
    }

    // 删除信息
    function delInfo(id) {
        $.get(common_ip + '/users/del', { id }, (res) => {
            if (res.code === 1000) {
                getList()
            }
        })
    }

    //清除新增弹窗数据
    function clearInput() {
        $('#name').val('');
        $('#room-name').val('');
    }

    // 登录 获取用户信息
    function getUserInfo(userName) {
        $.get(common_ip + '/users/get', { name: userName }, function(res) {
            if (res.code == 10000) {
                userId = res.data.id;
                sessionStorage.setItem('info', JSON.stringify({ userId, userName }))
                $userWrap.hide();
                clearInput();
                alert('登录成功')
                isLoadJoin();
            } else {
                alert('暂无此账号')
            }
        })
    }
    
    // 获取聊天消息列表
    function getMsgList() {
        let params = userId ? { userId, roomId } : { roomId }
        $.get('/msgList', params, function(res) {
            if(res.code == 10000){
                list = res.data;
                renderHtml(list);
            }
        })
    }
    // 获取房间成员
    function renderRoomMember(list, myLevel, info) {
        let str = ``;
        list.map(item => {
            if(info) {
                if (info.userName == item.userName) {
                    str += `<li data-id="${item.id}" 
                        data-uid="${item.userId}" 
                        class="level-me 
                        ${isChangeRole(item)}">
                        ${item.userName} ${ info.userName == item.userName ? '<span class="list-me">我</span>' : '' }${item.level == 2 ? '<i class="master">群主</i>' : ''}
                    </li>`
                }  else {
                    str += `<li data-id="${item.id}" 
                            data-uid="${item.userId}" 
                            class="${isChangeRole(item, myLevel)}">
                            ${item.userName} ${ info.userName == item.userName ? '<span class="list-me">我</span>' : '' }${item.level == 2 ? '<i class="master">群主</i>' : myLevel > 0 ? '<span class="del">x</span>' : ''}
                        </li>`
                        // <span class="set-manager">set</span> // 设置管理员 下期
                }
            } else {
                str += `<li data-id="${item.id}" 
                            data-uid="${item.userId}" 
                            class="${isChangeRole(item, myLevel)}">
                            ${item.userName}${item.level == 2 ? '<i>群主</i>' : ''}
                        </li>`
                }
        })
        $('#members').html(str)
    }
    // 登录校验
    function isLoadJoin() {
        let info = JSON.parse(sessionStorage.getItem('info'))
        let roomInfo = JSON.parse(sessionStorage.getItem('roomInfo'))
        if(info || roomInfo) {
            info ? (userName = info.userName, userId = info.userId, isIfLogin(userId)) : 0
            roomInfo ? (roomId = roomInfo.roomId, roomName = roomInfo.roomName, $chatTitle.html(roomName)) : 0
            if (roomId) {
                let params = {
                    roomId: roomId
                }
                userId ? params['userId'] = userId : 0
                userName ? params['userName'] = userName : 0
                socket = io(ip, {
                    query: params
                });
                connection()
                // 聊天消息列表
                getMsgList();
            }
            
        }
    }
    function isIfLogin(userId) {
        // 登录之后置灰
        if (userId) {
            $set.addClass('not-click')
            $load.addClass('not-click')
        } else {
            $set.removeClass('not-click')
            $load.removeClass('not-click')
        }
    }
    // 获取cookie
    function getCookie(userName) {
        var arr,reg=new RegExp("(^| )"+userName+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
        else
        return null;
    }

    // 屏幕滚到最低侧 进度30%
    function screenToBottom(hei) {
        var ele = $('#chat-wrap');
        let divHeight = ele[0].scrollHeight + hei
        ele.scrollTop(divHeight)
    }
    // 去除前后空格
    function Trim(str) { 
        str += ''
        return str.replace(/(^\s*)|(\s*$)/g, ""); 
    }
    // 不同权限处理
    function isChangeRole(item, level) {
        let str = ''
        if (item.level >= 2) {
            str = 'level-master '
        } else if (item.level >= 1) {
            str = 'level-manager level-can'
        } else {
            str = 'level-member level-can'
        }
        return str
    }
})