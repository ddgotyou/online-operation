import { defineComponent } from "vue";
import { UserInfo } from "@/types/userType";
import { USER_KEY } from "@/global";

export default defineComponent({
  name: "TableEditor",
  data() {
    return {
      userInfo: {} as UserInfo,
      sheet: null,
    };
  },
  mounted() {
    //获取用户信息
    this.fetchUser();
    //初始化表单数据
    this.initSheet();
  },
  methods: {
    //获取当前用户信息和在线用户信息
    async fetchUser() {
      this.userInfo = JSON.parse(
        localStorage.getItem(USER_KEY) || "{}"
      ) as UserInfo;
    },
    initSheet() {
      //初始化表单
    },
  },
});
