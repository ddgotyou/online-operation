export type QueryUser = {
  user_name: string;
};

export type UserInfo = {
  id: number | string;
  userName: string;
  password?: string;
  role?: string;
  token?: string;
  // token: string | null,
  // token: string | undefined,
  // token: string | null | undefined,
  // token: string | null | undefined | null,
};
