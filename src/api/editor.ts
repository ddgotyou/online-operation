import axios from "axios";
import { ENV_SERVER_PROD, ENV_SERVER_DEV } from "@/global";
import { DocType } from "@/types/docType";
//配置axios默认baseURL
axios.defaults.baseURL =
  process.env.NODE_ENV === "production" ? ENV_SERVER_PROD : ENV_SERVER_DEV;
//获取文档信息
export async function getDocInfo(params: { doc_id: string }): Promise<DocType> {
  try {
    const res = await axios.get("/editor/get_doc", { params });
    console.log("doc", res.data);
    return res.data;
  } catch (err) {
    console.log(err);
    return {} as DocType;
  }
}

//修改文档信息
export async function updateDocContent(params: {
  doc_id: string;
  content: string;
}): Promise<number> {
  try {
    const res = await axios.post("/editor/update_doc_content", params);
    console.log("update", res);
    return 1;
  } catch (err) {
    console.log(err);
    return 0;
  }
}
