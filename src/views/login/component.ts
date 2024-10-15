import { defineComponent } from "vue";
import { queryUser } from "@/api/users";
import { UserInfo } from "@/types/userType";
import { USER_KEY } from "@/global";

export default defineComponent({
  data() {
    return {
      userInfo: {
        _id: "",
        user_name: "",
      } as UserInfo,
    };
  },
  methods: {
    async validate() {
      if (!this.userInfo.user_name) {
        console.log("用户名不能为空");
      }
      const params = {
        user_name: this.userInfo.user_name,
      };
      const res = await queryUser(params);
      this.userInfo = res?.data as UserInfo;
      console.log(this.userInfo);
      //存储用户信息
      localStorage.setItem(USER_KEY, JSON.stringify(this.userInfo));
      //@ts-ignore
      if (this.userInfo && this.userInfo._id) {
        //@ts-ignore
        this.$router.push({
          path: "/pic_editor",
        });
      }
    },
  },
});
