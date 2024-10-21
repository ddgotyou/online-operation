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
  diff_length?: number;
  update_time: number | string;
  op_user: number | string;
  doc_id: string;
};

export type FocusStateType = {
  focus_pos: Array<number>;
  focus_user: {
    _id: number | string;
    user_name: string;
  };
};
