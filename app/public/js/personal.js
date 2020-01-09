$(function() {
    var $chat = $('#chat-wrap');
    var $notice = $('#notice');
    var $chatYou = $('#chat-you');

    var list = [];
    var socketId = getQueryString('id');
    var socket = null;
    let ip = window.location.host+'/chat';
    let socket_ip = window.location.host + '/socket';
    let common_ip = 'http://' + ip;

    var toInfo = JSON.parse(uncompileStr(getQueryString('session')))
    var toUserId = toInfo.to_userId
    var toUserName = toInfo.to_userName


    var myInfo = JSON.parse(sessionStorage.getItem('info'))
    var name = myInfo.userName;
    var userId = myInfo.userId

    $chatYou.html(toInfo.to_userName)
    setChat();

    function setChat() {
        socket = io(socket_ip, {
            path: '/socket',
            query: {
                id: socketId,
                userId,
                userName: name,
                toUserId,
                toUserName
            }
        });
        connection();
    }
    // 连接成功
    function connection() {
        // 聊天消息列表
        getMsgList();
        // 建立连接
        socket.on('connect', function(data) {
            console.log('连接成功');
        })
        // 连接失败重新连接
        socket.on('connect_failed', function(data) {
            console.log('连接失败', data);
        })
        //监听服务消息
        socket.on('personMsg',function(data){
            list.push(JSON.parse(data))
            renderHtml(list);
        });
        //监听socket断开与重连。
        socket.on('disconnect', function() {
            console.log("与服务断器开");
        });
        socket.on('reconnect', function() {
            console.log("重新连接到服务器");
        });
    }

    window.socket = socket;

    function removeAllSpace(str) {
        // return str.replace(/\s+/g, "");
        return str.trim();
    }

    function renderHtml (list) {
        let html = ``;
        list.map(item => {
            html += `<div  class="msg-cont clear ${item.from_user_id == userId ? 'me-cont' : 'you-cont'}">
                        <div class="${item.from_user_id == userId ? 'me' : 'you'}">
                            <div class="user_name">${item.from_user_name}</div>
                            <div class="user_tim">${dateFtt(item.msg_time)}</div>
                            <div class="chat_msg">${item.msg}</div>
                        </div>
                    </div>`
        })
        $chat.html(html)
    }

    function getQueryString(name) {
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r!=null)return  unescape(r[2]); return null;
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

    // 发送消息
    function emitMessage() {
        let msg = removeAllSpace($('#notice').val());
        let tim = new Date().getTime();
        if(msg) {
            let params = { msg: msg, msg_time: tim, from_user_name: name, from_user_id: userId, to_user_id: toUserId, to_user_name: toUserName}
            console.log(params)
            socket.emit('personMsg', params); //向服务器发送消息
            $notice.val('')
        }
    }

    // 获取聊天消息列表
    function getMsgList() {
        let params = { userId, toUserId }
        $.get(common_ip + '/msg/chatList', params, function(res) {
            if(res.code == 10000){
                list = res.data;
                renderHtml(list);
            }
        })
    }
    // 获取cookie
    function getCookie(name) {
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
        else
        return null;
    }
    //字符串进行解密   
    function uncompileStr(code){
        code = unescape(code);        
        var c=String.fromCharCode(code.charCodeAt(0)-code.length);        
        for(var i=1;i<code.length;i++){        
            c+=String.fromCharCode(code.charCodeAt(i)-c.charCodeAt(i-1));        
        }        
        return c;
    }
    // 去除前后空格
    function Trim(str) { 
        str += ''
        return str.replace(/(^\s*)|(\s*$)/g, ""); 
    }
})