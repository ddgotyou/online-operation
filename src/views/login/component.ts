import { defineComponent } from "vue";
import { getUsers } from "@/api/users";
import { UserInfo } from "@/types/userType";

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
    validate() {
      if (!this.userInfo.userName) {
        console.log("用户名不能为空");
      }
      const params = {
        user_name: this.userInfo.userName,
      };
      console.log(params);
      const userInfo = getUsers(params);
      console.log(userInfo);
    },
  },
});
