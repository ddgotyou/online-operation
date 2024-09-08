import { WS_SERVER } from "@/global";
class WebSocketInstance {
  url: string;
  messageArr: Array<any>;
  socket: WebSocket | null;
  constructor(url: string) {
    this.url = `${WS_SERVER}${url}`;
    this.messageArr = [];
    this.socket = null;
  }

  createSocket() {
    this.socket = new WebSocket(this.url); // 生成WebSocket实例化对象

    // 使用WebSocket的原生方法onopen去连接开启
    this.socket.onopen = function (e) {
      console.log("连接成功");
    };
    // 使用WebSocket的原生方法onerror去兜错一下
    this.socket.onerror = (e) => {
      console.error("连接错误", e);
    };
    // 使用WebSocket的原生方法onmessage与服务器关联
    this.socket.onmessage = (wsObj) => {
      console.log("收到消息", wsObj);
      this.messageArr.push(wsObj.data);
    };
  }
  sendAsString(msg: any) {
    if (!this.socket) return;
    if (this.socket!.readyState !== WebSocket.OPEN) {
      console.log("连接未开启");
      return;
    }
    console.log("发送消息", msg);
    // 使用WebSocket的原生方法send去发消息
    this.socket.send(JSON.stringify(msg));
  }
  close() {
    if (!this.socket) return;
    // 使用WebSocket的原生方法close去关闭已经开启的WebSocket服务
    this.socket.close();
    this.socket = null; // 回归默认值
    this.messageArr = []; // 清空消息数组
  }
}

export default WebSocketInstance;
