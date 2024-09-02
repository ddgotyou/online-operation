import { defineComponent } from "vue";
import { UserInfo } from "@/types/userType";
import { USER_KEY } from "@/global";

export default defineComponent({
  name: "PicEditor",
  data() {
    return {
      userInfo: {} as UserInfo,
    };
  },
  mounted() {
    this.userInfo = JSON.parse(
      localStorage.getItem(USER_KEY) || "{}"
    ) as UserInfo;
    console.log("to pic", this.userInfo);
  },
});
