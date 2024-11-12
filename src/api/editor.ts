import axios from "axios";
import { ENV_SERVER_PROD, ENV_SERVER_DEV } from "@/global";
import { DocType } from "@/types/docType";
import { collaborationUrl } from "@/utils/univer";
//配置axios默认baseURL
axios.defaults.baseURL = ENV_SERVER_DEV;
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

// 新建univer文档
export async function createNewSheet(params: {
  user_id: string;
  sheet_name: string;
  type: number;
}): Promise<any> {
  try {
    const sheet_params = {
      type: params.type, // instance type
      name: params.sheet_name, // sheet name
      creator: params.user_id, // creator name
    };
    const res = await axios.post(
      `/${params.type}/unit/-/create`,
      sheet_params,
      {
        headers: {
          "Content-Type": "application/json",
        },
        baseURL: collaborationUrl.snapshotServerUrl,
      }
    );
    console.log("创建文档", res);
    return res;
  } catch (err) {
    console.log(err);
    return err;
  }
}
