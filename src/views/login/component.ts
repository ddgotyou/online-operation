import { defineComponent } from "vue";
import { getUsers } from "@/api/users";
import { UserInfo } from "@/types/userType";
import { USER_KEY } from "@/global";

export default defineComponent({
  data() {
    return {
      userInfo: {
        id: "",
        userName: "",
      } as UserInfo,
    };
  },
  methods: {
    async validate() {
      if (!this.userInfo.userName) {
        console.log("用户名不能为空");
      }
      const params = {
        user_name: this.userInfo.userName,
      };
      const res = await getUsers(params);
      this.userInfo = res?.data as UserInfo;
      console.log(this.userInfo);
      //存储用户信息
      localStorage.setItem(USER_KEY, JSON.stringify(this.userInfo));
      //@ts-ignore
      if (this.userInfo && this.userInfo._id) {
        console.log("inin");
        //@ts-ignore
        this.$router.push({
          path: "/pic_editor",
        });
      }
    },
  },
});
