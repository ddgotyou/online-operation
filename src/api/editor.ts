import axios from "axios";
import { ENV_SERVER } from "@/global";
//配置axios默认baseURL
axios.defaults.baseURL = ENV_SERVER;
//获取文档信息
export async function getDocInfo(): Promise<string> {
  try {
    const res = await axios.get("/editor/get_doc");
    console.log("doc", res.data);
    return res.data;
  } catch (err) {
    console.log(err);
    return "no";
  }
}
