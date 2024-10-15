export type DocType = {
  _id: string;
  doc_index: number;
  doc_name: string;
  content: string;
  update_time: string;
};

export type DocLogType = {
  type: string;
  diff_content: string;
  position: number;
  update_time: number | string;
  op_user: number | string;
};
