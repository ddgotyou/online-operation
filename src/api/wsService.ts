import { WS_SERVER } from "@/global";
import { UserInfo } from "@/types/userType";
import { FocusStateType } from "@/types/docType";
class WebSocketInstance {
  url: string;
  curUser: UserInfo;
  messageArr: Array<any>;
  userArr: UserInfo[];
  socket: WebSocket | null;
  userSocket: WebSocket | null;
  hearbeatInterval: number | null;
  pongLastTime: number;
  doc_id: string;
  focusUserArr: FocusStateType[];
  constructor(url: string) {
    this.url = `${WS_SERVER}${url}`;
    // 信息数组
    this.messageArr = [];
    this.userArr = [];
    this.focusUserArr = [];
    //接口
    this.socket = null;
    this.userSocket = null;
    this.curUser = {} as UserInfo;
    //心跳定时器
    this.hearbeatInterval = null;
    // 后台心跳最后一次活跃时间
    this.pongLastTime = 0;
    //记录进入的文档id
    this.doc_id = "";
  }

  createSocket(newUser: UserInfo, doc_id: string) {
    this.socket = new WebSocket(this.url); // 生成WebSocket实例化对象
    if (doc_id) this.doc_id = doc_id;
    // 使用WebSocket的原生方法onerror去兜错一下
    this.socket.onerror = (e) => {
      console.error("连接错误", e);
    };

    //创建在线用户管理器
    this.setUserManager(newUser);
  }
  typeMsg(type: string, msg: any) {
    return JSON.stringify({
      type,
      data: msg,
    });
  }
  sendAsString(type: string, msg: any) {
    console.log(this.socket);
    if (!this.socket) return;
    console.log(this.socket.readyState);
    const timer = setInterval(() => {
      if (this.socket!.readyState === WebSocket.OPEN) {
        const new_msg = this.typeMsg(type, msg);
        console.log("发送消息", new_msg);
        // 使用WebSocket的原生方法send去发消息
        this.socket!.send(new_msg);
        clearInterval(timer);
      }
    }, 40);
  }
  setUserManager(newUser: UserInfo) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    this.curUser = newUser;
    this.userSocket = new WebSocket(`${this.url}/online_user`);
    //----user在线用户管理服务
    this.userSocket.onopen = function (e) {
      //新加入的用户信息
      if (that.curUser)
        that.userSocket?.send(that.typeMsg("addUser", that.curUser));
    };
    // 使用WebSocket的原生方法onerror去兜错一下
    this.userSocket.onerror = (e) => {
      console.error("用户服务器连接错误", e);
    };
    //message通道监听
    this.userMessageCb();
  }
  fetchOnlineUser(): UserInfo[] {
    //获取位于文档位置下的的在线用户列表
    this.userSocket?.send(this.typeMsg("fetchOnlineUser", this.doc_id));
    return this.userArr;
  }
  updateFocusUserArr(): FocusStateType[] {
    // 获取除了本用户的其他用户
    return this.focusUserArr.filter(
      (item) => item.focus_user._id !== this.curUser._id
    );
  }
  getOpMessage() {
    return this.messageArr.filter(
      (item) => item.includes("insert") || item.includes("delete")
    );
  }
  userMessageCb(cb?: (msg: any) => void) {
    this.userSocket!.onmessage = (e) => {
      //新增用户
      const { type, data, status } = JSON.parse(e.data);
      switch (type) {
        case "onlineUser": {
          if (status === "ok") {
            this.userArr = data;
          }
          break;
        }
        case "pong": {
          // console.log("拿到pong包");
          if (status === "ok") {
            // console.log("接受到pong");
            this.pongLastTime = Date.now();
          }
          break;
        }
        default:
          break;
      }
    };
  }
  // 用户心跳
  ping() {
    this.hearbeatInterval = setInterval(() => {
      // 发送心跳
      if (this.userSocket && this.doc_id) {
        this.userSocket.send(
          this.typeMsg("ping", { testUser: this.curUser, doc_id: this.doc_id })
        );
        if (!this.pongLastTime) this.pongLastTime = Date.now();
        if (Date.now() - this.pongLastTime > 10000) {
          //定时监测后台发包
          this.close();
        }
      }
    }, 1000);
  }
  messageCb(cb: (msg: any) => void) {
    if (!this.socket) return;
    // 使用WebSocket的原生方法onmessage与服务器关联
    this.socket.onmessage = (wsObj) => {
      console.log("收到消息", wsObj.data);
      const msg = JSON.parse(wsObj.data);
      const { type } = msg;
      switch (type) {
        case "oplog": {
          this.messageArr.push(msg);
          cb(msg);
          break;
        }
        case "focusUser": {
          this.focusUserArr = [...msg.data];
          break;
        }
      }
    };
  }
  // 重新连接
  reconnect() {
    this.close();
    this.createSocket(this.curUser, this.doc_id);
  }
  // 检测是否断开
  checkConnect() {
    if (this.userSocket && this.socket) {
      return true;
    } else return false;
  }
  //关闭链接
  close() {
    console.log("用户关闭连接");
    this.userSocket?.send(
      this.typeMsg("close", { user: this.curUser, doc: this.doc_id })
    );
    clearInterval(this.hearbeatInterval!);
    this.hearbeatInterval = null;
    this.pongLastTime = 0;
    if (!this.socket) return;
    // 使用WebSocket的原生方法close去关闭已经开启的WebSocket服务
    this.socket.close();
    this.userSocket?.close();
    this.userSocket = null;
    this.socket = null; // 回归默认值
    this.messageArr = []; // 清空消息数组
    this.userArr = [];
    this.curUser = {} as UserInfo;
    this.doc_id = "";
  }
}

export default WebSocketInstance;
