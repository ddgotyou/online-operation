const { defineConfig } = require("@vue/cli-service");
const path = require("path");
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    mode: "development",
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },
  },
});
