<template>
  <div class="editor">
    <h1>This is an editor page</h1>
    <div class="userList">
      <ul v-if="onlineUserList">
        <li v-for="(item, index) in onlineUserList" :key="index">
          <span
            :class="{ 'user-highlight': item.user_name === userInfo.user_name }"
          >
            {{ item.user_name }}</span
          >
        </li>
      </ul>
    </div>
    <div class="content">
      <div class="docInfo">
        文档信息
        <ul>
          <li v-for="(item, index) in docInfo" :key="index">
            {{ index !== "content" ? index + ":   " + item : "" }}
          </li>
        </ul>
      </div>
      <textarea
        v-model="docText"
        class="text-area"
        @input="inputDoc"
        @select="focusDoc"
      ></textarea>
      <button @click="save">提交</button>
    </div>
  </div>
</template>
<script lang="ts" src="./component.ts"></script>
<style lang="scss" scoped src="./index.scss"></style>
