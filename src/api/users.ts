//向http://localhost:3000/users发送请求 获取用户数据
import axios from "axios";
import type { QueryUser } from "@/types/userType";
import { ENV_SERVER } from "@/global";

//配置axios默认baseURL
axios.defaults.baseURL = ENV_SERVER;
export const queryUser = async (param: QueryUser) => {
  const { user_name } = param;
  if (!user_name) return;
  try {
    const res = await axios.get("/getUser", { params: { user_name } });
    return res;
  } catch (err) {
    console.log(err);
  }
};
