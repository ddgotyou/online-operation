const { defineConfig } = require("@vue/cli-service");
const { UniverPlugin } = require("@univerjs/webpack-plugin");
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
    plugins: [new UniverPlugin()],
  },
});
