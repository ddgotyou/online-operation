<template>
  <div class="about">
    <h1>This is an about page</h1>
    <input v-model="userInfo.userName" placeholder="用户名" />
    <button @click="validate()">登陆</button>
  </div>
</template>
<script lang="ts" src="./component.ts"></script>
