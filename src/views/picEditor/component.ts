import { defineComponent } from "vue";
import { UserInfo } from "@/types/userType";
import { USER_KEY } from "@/global";
import { getDocInfo, updateDocContent } from "@/api/editor";
import WebSocketInstance from "@/api/wsService";
import { DocType } from "@/types/docType";

export default defineComponent({
  name: "PicEditor",
  data() {
    return {
      userInfo: {} as UserInfo,
      docText: "",
      docInfo: {} as DocType,
      socket: new WebSocketInstance("/ws"),
      onlineUserList: [] as UserInfo[],
    };
  },
  beforeUnmount() {
    this.socket.close();
  },
  mounted() {
    //获取用户信息
    this.fetchUser();
    //获取文档信息
    this.getDoc();
    //创建socket链接
    this.socket.createSocket(this.userInfo);
    //推送消息
    setInterval(() => {
      // this.socket.sendAsString("hello server");
      this.onlineUserList = this.socket.fetchOnlineUser();
    }, 100);
  },
  methods: {
    async getDoc() {
      this.docInfo = await getDocInfo({ doc_id: "66f9208eac571ebed29f2e9c" });
      //获取文档内容
      this.docText = this.docInfo.content ?? "";
      console.log("此时编辑的文档信息", this.docInfo);
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
  },
});
