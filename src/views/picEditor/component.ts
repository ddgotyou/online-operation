import { defineComponent } from "vue";
import { UserInfo } from "@/types/userType";
import { USER_KEY } from "@/global";
import { getDocInfo, updateDocContent } from "@/api/editor";
import WebSocketInstance from "@/api/wsService";
import { DocType, DocLogType } from "@/types/docType";

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
    };
  },
  beforeUnmount() {
    this.socket.close();
  },
  mounted() {
    //获取用户信息
    this.fetchUser();
    //创建socket链接
    this.socket.createSocket(this.userInfo);
    this.socket.messageCb(this.applyOp);
    //获取文档信息
    this.getDoc();
    //推送消息
    setInterval(() => {
      // this.socket.sendAsString("hello server");
      if (this.docInfo._id)
        this.onlineUserList = this.socket.fetchOnlineUser(this.docInfo._id);
    }, 100);
  },
  methods: {
    async getDoc() {
      this.docInfo = await getDocInfo({ doc_id: "66f9208eac571ebed29f2e9c" });
      //获取文档内容
      this.docText = this.docInfo.content ?? "";
      //发送文档信息
      this.socket.sendAsString(this.docInfo);
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
    inputDoc(e: any) {
      console.log(e, e.target.selectionStart);
      //操作原子化
      const newlog = {
        type: "",
        diff_content: "",
        position: 0,
        update_time: new Date().getTime(),
        op_user: this.userInfo._id,
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
      this.localLogStack.push(newlog);
      this.socket.sendAsString(newlog);
    },

    //应用操作日志更新内容
    applyOp(msg: any) {
      try {
        const op = JSON.parse(msg);
        if (typeof op === "object") {
          if (op.type === "insert") {
            this.docText =
              this.docText.slice(0, op.position) +
              op.diff_content +
              this.docText.slice(op.position);
            this.docInfo.content = this.docText;
          } else if (op.type === "delete") {
            this.docText =
              this.docText.slice(0, op.position) +
              this.docText.slice(op.position + 1);
            this.docInfo.content = this.docText;
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
  },
});
