import { defineComponent } from "vue";
import { queryUser, registerUser } from "@/api/users";
import { UserInfo } from "@/types/userType";
import { USER_KEY } from "@/global";
import { showDialog } from "vant";

export default defineComponent({
  data() {
    return {
      userInfo: {
        _id: "",
        user_name: "",
      } as UserInfo,
      loginType: "login",
    };
  },
  methods: {
    backLogin() {
      this.loginType = "login";
      this.userInfo = {} as UserInfo;
    },
    //注册
    async register() {
      if (this.userInfo.user_name && this.userInfo.password) {
        const params = {
          user_name: this.userInfo.user_name,
          password: this.userInfo.password,
        };
        const res = await registerUser(params);
        console.log("创建注册新用户", res);
        //弹窗、重置、返回
        if (res) {
          showDialog({
            title: "注册成功",
            message: "请返回登录",
            confirmButtonText: "返回",
            showCancelButton: false,
          }).then(() => {
            this.loginType = "login";
            this.userInfo = {} as UserInfo; //清空重置
          });
        }
      } else {
        showDialog({
          title: "注册无效",
          message: "请重新注册，并输入有效的用户名或密码",
          showCancelButton: true,
        });
        //重置
        this.userInfo = {} as UserInfo; //清空重置
      }
    },
    async validate() {
      if (!this.userInfo.user_name) {
        console.log("用户名不能为空");
        return;
      }
      if (!this.userInfo.password) {
        console.log("密码不能为空");
        return;
      }
      const params = {
        user_name: this.userInfo.user_name,
        password: this.userInfo.password,
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
      } else {
        //不存在用户
        showDialog({
          title: "账号或密码错误",
          message: "请重新登录",
          showCancelButton: true,
        }).then(() => {
          this.userInfo = {} as UserInfo;
        });
      }
    },
  },
});
