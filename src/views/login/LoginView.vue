<template>
  <div class="about">
    <template v-if="loginType === 'login'">
      <h1>Login</h1>
      <input
        v-model="userInfo.user_name"
        placeholder="用户名"
        style="display: block; margin: 5px auto"
      />
      <input
        v-model="userInfo.password"
        placeholder="密码"
        type="password"
        style="display: block; margin: 5px auto"
      />
      <button @click="validate()">登陆</button>
      <div class="register-tip" @click="loginType = 'register'">注册</div>
    </template>
    <template v-else-if="loginType === 'register'">
      <h1>注册</h1>
      <input
        v-model="userInfo.user_name"
        placeholder="用户名"
        style="display: block; margin: 5px auto"
      />
      <input
        v-model="userInfo.password"
        placeholder="密码"
        type="password"
        style="display: block; margin: 5px auto"
      />
      <button @click="backLogin()" style="margin-right: 20px">返回登陆</button>
      <button @click="register()">确定注册</button>
    </template>
  </div>
</template>
<script lang="ts" src="./component.ts"></script>
<style lang="scss" scoped>
.register-tip {
  width: 200px;
  color: rgb(75, 149, 214);
  text-align: left;
  margin: 20px auto;
}
</style>
