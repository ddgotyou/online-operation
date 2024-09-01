import { defineComponent } from "vue";
import { UserInfo } from "@/types/userType";

export default defineComponent({
  name: "PicEditor",
  data() {
    return {
      userInfo: this.$route.query as UserInfo,
    };
  },
  mounted() {
    console.log("to pic", this.userInfo);
  },
});
