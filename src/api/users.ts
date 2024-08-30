//向http://localhost:3000/users发送请求 获取用户数据
import axios from "axios";

export const getUsers = async () => {
  try {
    const res = await axios.get("http://localhost:3000/getuser");
    console.log(res.data);
    return res;
  } catch (err) {
    console.log(err);
  }
};
