import { defineComponent } from "vue";
import { getUsers } from "@/api/users";

export default defineComponent({
  setup() {
    return {
      // ...
    };
  },
  methods: {
    validate() {
      console.log(getUsers());
    },
  },
});
