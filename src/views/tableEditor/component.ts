import { defineComponent } from "vue";
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
// 接口与类型
import { getDocInfo, updateDocContent } from "@/api/editor";
import { DocType, DocLogType, FocusStateType } from "@/types/docType";

export default defineComponent({
  name: "TableEditor",
  data() {
    return {
      userInfo: {} as UserInfo,
      editor: null as any,
      docInfo: {} as DocType,
    };
  },
  components: {
    EditorContent,
  },
  mounted() {
    //获取用户信息
    this.fetchUser();
    // 获取文档信息
    this.getDoc();
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
          console.log("transaction applied", transaction);
          const changes = this.getChanges(transaction, state.doc);
        },
      });
      console.log("此时的导出内容json", JSON.stringify(this.editor.getJSON()));
      // json 转入html
      //   console.log(
      //     "转html",
      //     generateHTML(this.editor.getJSON(), [
      //       StarterKit.configure({ history: false }), //先取消撤销和重做
      //       Table,
      //       TableRow,
      //       TableCell,
      //       TableHeader,
      //     ])
      //   );
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
      console.log("dd", changes);
      return changes;
    },
    // 设置光标所在的位置
    setCursorPosition(start: number, end: number) {
      this.editor.commands.setTextSelection({ from: start, to: end });
    },
  },
});
