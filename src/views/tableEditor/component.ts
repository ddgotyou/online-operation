import { defineComponent, handleError } from "vue";
import { UserInfo } from "@/types/userType";
import { USER_KEY } from "@/global";
// 引入tiptap编辑器库
import { Editor, EditorContent, EditorEvents } from "@tiptap/vue-3";
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
      isCommandsTrigger: false,
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
    "docInfo.content": {
      handler(newVal) {
        if (newVal) {
          // console.log("更新的文档内容", newVal);
          const timer = setTimeout(() => {
            // 保存文档
            this.save();
            clearInterval(timer);
          }, 500);
        }
      },
    },
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
      console.log("保存状态", status);
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
        // content: ,
        extensions: [
          StarterKit.configure({ history: false }), //先取消撤销和重做
          Table,
          TableRow,
          TableCell,
          TableHeader,
        ],
        onUpdate: this.updateOp,
      });
      // this.applyOp({});
    },
    // 更新操作日志
    updateOp({ editor, transaction }: EditorEvents["transaction"]) {
      console.log("eee", this.editor);
      if (this.isCommandsTrigger) return;
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
      const state = editor.state;
      // console.log("transaction applied", transaction);
      const changes = this.getChanges(transaction, state.doc)[0];
      if (changes) {
        console.log("changes", changes);
        // 有变化
        if (changes.after) {
          // 新增
          newlog.type = "insert";
          newlog.diff_content = changes.after;
          newlog.position = changes.from;
          newlog.diff_length = changes.to - changes.from;
          console.log("newlog", newlog);
          //----NOTE：发送操作日志
          this.socket.sendAsString("oplog", newlog);
          // 更新最新的content
          this.docInfo.content = JSON.stringify(this.editor.getJSON());
        } else {
          if (changes.from !== changes.to) {
            // 删除
            newlog.type = "delete";
            newlog.diff_length = changes.to - changes.from;
            newlog.position = changes.from;
            console.log("newlog", newlog);
            //----NOTE：发送操作日志
            this.socket.sendAsString("oplog", newlog);
            // 更新最新的content
            this.docInfo.content = JSON.stringify(this.editor.getJSON());
          }
        }
      }
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
      // ---test
      // const new_log = {
      //   type: "delete",
      //   diff_content: "",
      //   position: 109,
      //   diff_length: 3,
      //   update_time: 1730018945848,
      //   op_user: "66d427b805a349637b5531fc",
      //   doc_id: "67177d42b2b46e815e9b4e14",
      // };
      // this.insertTextAtPosition(
      //   new_log.diff_content,
      //   new_log.position,
      //   new_log.position + new_log.diff_length
      // );
      try {
        const op = msg.data;
        console.log("receive op", op);
        if (typeof op === "object") {
          if (op.type === "insert" || op.type === "delete") {
            this.insertTextAtPosition(
              op.diff_content,
              op.position,
              op.position + op.diff_length
            );
            // 更新最新的content
            this.docInfo.content = JSON.stringify(this.editor.getJSON());
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
    insertTextAtPosition(text: string, from_pos: number, to_pos: number) {
      this.isCommandsTrigger = true;
      this.editor.commands.insertContentAt(
        { from: from_pos, to: to_pos },
        text,
        { updateSelection: false }
      );
      // this.editor.commands.setTextSelection({
      //   from: from_pos,
      //   to: to_pos,
      // });
      // this.editor.commands.insertContent(text);

      this.isCommandsTrigger = false;
    },
  },
});
