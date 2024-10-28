//向http://localhost:3000/users发送请求 获取用户数据
import axios from "axios";
import type { QueryUser } from "@/types/userType";
import { ENV_SERVER_PROD, ENV_SERVER_DEV } from "@/global";

//配置axios默认baseURL
// axios.defaults.baseURL =
//   process.env.NODE_ENV === "production" ? ENV_SERVER_PROD : ENV_SERVER_DEV;
axios.defaults.baseURL = ENV_SERVER_DEV;

export const queryUser = async (param: QueryUser) => {
  const { user_name, password } = param;
  try {
    const res = await axios.get("/getUser", {
      params: { user_name, password },
    });
    return res;
  } catch (err) {
    console.log(err);
  }
};

export const registerUser = async (params: QueryUser) => {
  try {
    const res = await axios.post("/register", params);
    return res;
  } catch (err) {
    console.log(err);
  }
};
