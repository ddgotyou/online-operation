import { defineComponent } from "vue";
import { UserInfo } from "@/types/userType";
import { USER_KEY } from "@/global";
import { getDocInfo } from "@/api/editor";
import WebSocketInstance from "@/api/wsService";

export default defineComponent({
  name: "PicEditor",
  data() {
    return {
      userInfo: {} as UserInfo,
      text: "Hello World",
      docInfo: "",
      socket: new WebSocketInstance("/ws"),
    };
  },
  mounted() {
    this.userInfo = JSON.parse(
      localStorage.getItem(USER_KEY) || "{}"
    ) as UserInfo;
    //获取文档信息
    this.getDoc();
    //创建socket链接
    this.socket.createSocket();
    //推送消息
    setInterval(() => {
      this.socket.sendAsString("hello server");
    }, 1000);
  },
  methods: {
    async getDoc() {
      this.docInfo = await getDocInfo();
    },
  },
});
