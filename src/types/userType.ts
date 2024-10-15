export type QueryUser = {
  user_name: string;
};

export type UserInfo = {
  _id: number | string;
  user_name: string;
  password?: string;
  role?: string;
  token?: string;
};
