import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "login",
    component: () => import("../views/login/LoginView.vue"),
  },
  //editor字符串test路径
  {
    path: "/pic_editor",
    name: "picEditor",
    component: () => import("../views/picEditor/PicEditor.vue"),
  },
  {
    path: "/table_editor",
    name: "tableEditor",
    component: () => import("../views/tableEditor/TableEditor.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
