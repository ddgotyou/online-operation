import { defineComponent } from "vue";
import { UserInfo } from "@/types/userType";
import { USER_KEY } from "@/global";
import { getDocInfo, updateDocContent } from "@/api/editor";
import WebSocketInstance from "@/api/wsService";
import { DocType, DocLogType, FocusStateType } from "@/types/docType";

export default defineComponent({
  name: "PicEditor",
  data() {
    return {
      userInfo: {} as UserInfo,
      docText: "",
      docInfo: {} as DocType,
      socket: new WebSocketInstance("/ws"),
      onlineUserList: [] as UserInfo[],
      //本地操作日志栈
      localLogStack: [] as DocLogType[],
      //文本选择范围
      selectRange: 0,
      listnerTimer: 0,
      //所有用户的焦点位置
      allUserfocusState: [] as FocusStateType[],
      // 当前用户的焦点状态
      curUserFocusState: {} as FocusStateType,
    };
  },
  beforeUnmount() {
    this.socket.close();
    clearInterval(this.listnerTimer);
  },
  async mounted() {
    //获取用户信息
    this.fetchUser();
    //获取文档信息
    await this.getDoc();
    //创建socket链接
    this.socket.createSocket(this.userInfo, this.docInfo._id);
    this.socket.messageCb(this.applyOp);
    //发送文档信息
    this.socket.sendAsString("docInfo", this.docInfo);

    // 定时获取用户在线列表、检测端连状态
    this.listnerTimer = setInterval(() => {
      const isConnect = this.socket.checkConnect();
      if (isConnect) {
        if (this.docInfo._id) {
          // 获取在线用户列表
          this.onlineUserList = this.socket.fetchOnlineUser();
          // 更新获取用户的聚焦状态
          this.allUserfocusState = [...this.socket.updateFocusUserArr()];
          if (
            this.curUserFocusState.focus_pos &&
            this.curUserFocusState.focus_pos.length > 0
          ) {
            this.allUserfocusState.unshift(this.curUserFocusState);
          }
        }
      } else {
        console.log("断开连接，重定向界面");
        // 断开链接
        //-----NOTE：简化处理，跳回login界面
        this.$router.push({
          path: "/",
        });
      }
    }, 300);
    // 定时传递用户心跳
    this.socket.ping();
  },
  methods: {
    async getDoc() {
      this.docInfo = await getDocInfo({ doc_id: "66f9208eac571ebed29f2e9c" });
      //获取文档内容
      this.docText = this.docInfo.content ?? "";
    },
    //保存文档内容
    async save() {
      const status = await updateDocContent({
        doc_id: "66f9208eac571ebed29f2e9c",
        content: this.docText,
      });
      console.log(status);
      if (status) {
        console.log("保存成功");
      }
    },
    //获取当前用户信息和在线用户信息
    async fetchUser() {
      this.userInfo = JSON.parse(
        localStorage.getItem(USER_KEY) || "{}"
      ) as UserInfo;
    },
    // 聚焦监听
    focusDoc(e: any) {
      console.log("focusDoc");
      this.curUserFocusState = {
        focus_user: {
          _id: this.userInfo._id,
          user_name: this.userInfo.user_name,
        },
        focus_pos: [0, 0],
      };
      // 通知change focus状态
      this.socket.sendAsString("updateFocusState", {
        doc: this.docInfo._id,
        focusState: this.curUserFocusState,
      });
    },
    // 失焦监听
    blurDoc(e: any) {
      console.log("blurDoc");
      this.curUserFocusState = {
        focus_user: {
          _id: this.userInfo._id,
          user_name: this.userInfo.user_name,
        },
        focus_pos: [],
      };
      // 通知change focus状态
      this.socket.sendAsString("updateFocusState", {
        doc: this.docInfo._id,
        focusState: this.curUserFocusState,
      });
    },
    //聚焦选择事件监听，获取光标范围
    selectDoc(e: any) {
      console.log("selectDoc", e.target.selectionStart, e.target.selectionEnd);
      this.selectRange = e.target.selectionEnd - e.target.selectionStart;
    },
    //输入事件监听
    inputDoc(e: any) {
      console.log(e, e.target.selectionStart, e.target.selectionEnd);
      //操作原子化
      const newlog = {
        type: "",
        diff_content: "",
        position: 0,
        diff_length: 0,
        update_time: new Date().getTime(),
        op_user: this.userInfo._id,
        doc_id: this.docInfo._id,
      };

      //-----input还有撤销操作可支持
      let op_position = e.target.selectionStart;
      if (e.inputType === "deleteContentBackward") {
        newlog.type = "delete";
      } else if (e.inputType === "insertText") {
        op_position -= 1;
        newlog.type = "insert";
        newlog.diff_content = e.data;
      } else if (e.inputType === "historyUndo") {
        //----撤销上一次操作
        console.log("撤销");
      }
      newlog.position = op_position;
      //如果新旧文本的操作差异大于等于1，则认为通过选中进行修改
      if (Math.abs(this.docInfo.content.length - this.docText.length) > 1) {
        newlog.diff_length = this.selectRange;
      }
      this.localLogStack.push(newlog);
      this.socket.sendAsString("oplog", newlog);
    },

    //应用操作日志更新内容
    applyOp(msg: any) {
      try {
        const op = msg.data;
        if (typeof op === "object") {
          if (op.type === "insert") {
            this.docText =
              this.docText.slice(0, op.position) +
              op.diff_content +
              this.docText.slice(op.position + (op.diff_length ?? 0));
            this.docInfo.content = this.docText;
          } else if (op.type === "delete") {
            const len = op.diff_length ? op.diff_length : 1;
            this.docText =
              this.docText.slice(0, op.position) +
              this.docText.slice(op.position + len);
            this.docInfo.content = this.docText;
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
  },
});
