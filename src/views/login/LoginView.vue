<template>
  <div class="about">
    <h1>Login</h1>
    <input v-model="userInfo.user_name" placeholder="用户名" />
    <button @click="validate()">登陆</button>
  </div>
</template>
<script lang="ts" src="./component.ts"></script>
