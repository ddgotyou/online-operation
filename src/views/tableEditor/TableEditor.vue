<template>
  <div class="table-editor">
    <h1>This is an table editor page</h1>
    <div class="user-list">
      <template v-for="(item, index) in onlineUserList" :key="index">
        <Avatar
          :bgcolor="colorMap[item._id]"
          :name="item.user_name[0]"
          v-if="item.user_name"
        />
      </template>
    </div>
    <div id="sheet-container" class="sheet-container">
      <editor-content :editor="editor" />
    </div>
  </div>
</template>
<script lang="ts" src="./component.ts"></script>
<style lang="scss" scoped src="./index.scss"></style>
