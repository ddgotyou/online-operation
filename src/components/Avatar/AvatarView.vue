<template>
  <div class="avatar" :style="{ backgroundColor: bgcolor }">
    <span>{{ name }}</span>
  </div>
</template>

<style scoped>
.avatar {
  width: 50px;
  height: 50px;
  overflow: hidden;
  border-radius: 50%;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  line-height: 50px;
  margin: 0 20px;
}
</style>

<script>
import { defineComponent } from "vue";
export default defineComponent({
  name: "AvatarView",
  props: {
    bgcolor: {
      type: String,
      default: "#000",
    },
    name: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
  },
});
</script>
