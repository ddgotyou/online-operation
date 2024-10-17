import { WS_SERVER } from "@/global";
import { UserInfo } from "@/types/userType";
class WebSocketInstance {
  url: string;
  curUser: UserInfo;
  messageArr: Array<any>;
  userArr: UserInfo[];
  socket: WebSocket | null;
  userSocket: WebSocket | null;
  hearbeatInterval: number | null;
  constructor(url: string) {
    this.url = `${WS_SERVER}${url}`;
    this.messageArr = [];
    this.userArr = [];
    this.socket = null;
    this.userSocket = null;
    this.curUser = {} as UserInfo;
    this.hearbeatInterval = null;
  }

  createSocket(newUser: UserInfo) {
    this.socket = new WebSocket(this.url); // 生成WebSocket实例化对象
    // 使用WebSocket的原生方法onerror去兜错一下
    this.socket.onerror = (e) => {
      console.error("连接错误", e);
    };

    //创建在线用户管理器
    this.setUserManager(newUser);
  }
  //心跳通道
  ping() {
    this.hearbeatInterval = setInterval(() => {
      this.userSocket?.send(this.typeMsg("ping", ""));
    }, 500);
  }
  typeMsg(type: string, msg: any) {
    return JSON.stringify({
      type,
      data: msg,
    });
  }
  sendAsString(type: string, msg: any) {
    if (!this.socket) return;

    if (this.socket!.readyState === WebSocket.OPEN) {
      const new_msg = this.typeMsg(type, msg);
      console.log("发送消息", new_msg);
      // 使用WebSocket的原生方法send去发消息
      this.socket!.send(new_msg);
    }
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
  fetchOnlineUser(doc_id: string): UserInfo[] {
    //获取位于文档位置下的的在线用户列表
    this.userSocket?.send(this.typeMsg("fetchOnlineUser", doc_id));
    return this.userArr;
  }
  getOpMessage() {
    return this.messageArr.filter(
      (item) => item.includes("insert") || item.includes("delete")
    );
  }
  userMessageCb(cb?: (msg: any) => void) {
    this.userSocket!.onmessage = (e) => {
      //新增用户
      const msg = JSON.parse(e.data).data;
      if (Array.isArray(msg)) {
        this.userArr = msg;
      } else {
        this.userArr.push(msg);
      }
    };
  }
  messageCb(cb: (msg: any) => void) {
    if (!this.socket) return;
    // 使用WebSocket的原生方法onmessage与服务器关联
    this.socket.onmessage = (wsObj) => {
      console.log("收到消息", wsObj.data);
      this.messageArr.push(wsObj.data);
      cb(wsObj.data);
    };
  }
  //关闭链接
  close() {
    if (!this.socket) return;
    // 使用WebSocket的原生方法close去关闭已经开启的WebSocket服务
    this.socket.close();
    this.userSocket?.close();
    this.userSocket = null;
    this.socket = null; // 回归默认值
    this.messageArr = []; // 清空消息数组
    this.userArr = [];
  }
}

export default WebSocketInstance;
