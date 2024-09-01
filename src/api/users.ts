//向http://localhost:3000/users发送请求 获取用户数据
import axios from "axios";
import type { QueryUser } from "@/types/userType";

export const ENV_SERVER = "http://localhost:3000";

//配置axios默认baseURL
axios.defaults.baseURL = ENV_SERVER;
export const getUsers = async (param: QueryUser) => {
  const { user_name } = param;
  if (!user_name) return;
  try {
    const res = await axios.get("/getuser", { params: { user_name } });
    console.log(res.data);
    return res;
  } catch (err) {
    console.log(err);
  }
};
