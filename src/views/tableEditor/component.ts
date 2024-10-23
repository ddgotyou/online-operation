import { defineComponent, handleError } from "vue";
import { UserInfo } from "@/types/userType";
import { USER_KEY } from "@/global";
// 引入tiptap编辑器库
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { generateHTML } from "@tiptap/html"; //json转html
import { Transaction } from "@tiptap/pm/state";
import WebSocketInstance from "@/api/wsService";
// 接口与类型
import { getDocInfo, updateDocContent } from "@/api/editor";
import { DocType, DocLogType, FocusStateType } from "@/types/docType";
// 用户颜色
import { USER_COLOR_LIST } from "@/global";
// 公用组件
import Avatar from "@/components/Avatar/AvatarView.vue";

export default defineComponent({
  name: "TableEditor",
  components: {
    EditorContent,
    Avatar,
  },
  data() {
    return {
      userInfo: {} as UserInfo,
      editor: null as any,
      docInfo: {} as DocType,
      // websocket 通道
      socket: new WebSocketInstance("/ws"),
      onlineUserList: [] as UserInfo[],
      listnerTimer: 0,
      //所有用户的焦点位置
      allUserfocusState: [] as FocusStateType[],
      // 当前用户的焦点状态
      curUserFocusState: {} as FocusStateType,
      // 颜色map
      colorMap: {} as any,
    };
  },
  beforeUnmount() {
    //用户离开
    this.socket.close();
    clearInterval(this.listnerTimer);
  },
  async mounted() {
    //获取用户信息
    this.fetchUser();
    // 获取文档信息
    await this.getDoc();
    // websocket监听
    //创建socket链接
    this.socket.createSocket(this.userInfo, this.docInfo._id);
    this.socket.messageCb(this.applyOp);
    console.log("dddc", this.docInfo);
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
  watch: {
    onlineUserList: {
      handler(newVal: any, oldVal: any) {
        if (newVal && oldVal && newVal.length !== oldVal.length) {
          //更新颜色
          newVal.forEach((item: any) => {
            if (!this.colorMap[item._id]) {
              this.colorMap[item._id] =
                USER_COLOR_LIST[
                  Math.floor(Math.random() * USER_COLOR_LIST.length)
                ];
            }
          });
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    //获取当前用户信息和在线用户信息
    async fetchUser() {
      this.userInfo = JSON.parse(
        localStorage.getItem(USER_KEY) || "{}"
      ) as UserInfo;
    },
    // 获取文档信息
    async getDoc() {
      this.docInfo = await getDocInfo({ doc_id: "67177d42b2b46e815e9b4e14" });
      //初始化表单数据
      this.initSheet(this.docInfo.content);
    },
    //保存文档内容
    async save() {
      const status = await updateDocContent({
        doc_id: "67177d42b2b46e815e9b4e14",
        content: this.docInfo.content,
      });
      console.log(status);
      if (status) {
        console.log("保存成功");
      }
    },
    initSheet(content: string) {
      //获取初始化内容
      const parseContent = JSON.parse(content);
      const parseHTML = generateHTML(parseContent, [
        StarterKit.configure({ history: false }), //先取消撤销和重做
        Table,
        TableRow,
        TableCell,
        TableHeader,
      ]);
      //初始化表单
      this.editor = new Editor({
        content: `${parseHTML}`,
        extensions: [
          StarterKit.configure({ history: false }), //先取消撤销和重做
          Table,
          TableRow,
          TableCell,
          TableHeader,
        ],
        onUpdate: ({ editor }) => {
          console.log("更新后内容json", editor.getJSON());
        },
        onTransaction: ({ editor, transaction }) => {
          const state = editor.state;
          // console.log("transaction applied", transaction);
          const changes = this.getChanges(transaction, state.doc);
        },
      });
    },
    // 获取详细字符串内容变化
    getChanges(transaction: Transaction, doc: any) {
      const changes = [] as any[];
      transaction.steps.forEach((step: any) => {
        const from = step.from;
        const to = step.to;
        const slice = step.slice;
        const before = doc.textBetween(from, to);
        const after = slice
          ? slice.content.textBetween(0, slice.content.size)
          : "";
        changes.push({ from, to, before, after });
      });
      console.log("ddchange", changes);
      return changes;
    },
    // 设置光标所在的位置
    setCursorPosition(start: number, end: number) {
      this.editor.commands.setTextSelection({ from: start, to: end });
    },
    // 设置所有用户光标的渲染
    renderAllUserCaret() {
      return;
    },
    // 设置用户光标情况
    setUserCaret(userFocusState: any) {
      // ----配置光标位置、颜色
      // 使用 TipTap 的 decoration 插入光标位置
      //   editor
      //     .chain()
      //     .focus()
      //     .createDecoration({
      //       from: start,
      //       to: end,
      //       className: `cursor-${userId}`,
      //       style: `border-left: 2px solid ${color};`,
      //     })
      //     .run();
    },
    //应用操作日志更新内容
    applyOp(msg: any) {
      try {
        const op = msg.data;
        console.log("op", op);
      } catch (e) {
        console.log(e);
      }
    },
  },
});
