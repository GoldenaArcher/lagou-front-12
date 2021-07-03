const path = require("path");
const common = require("./webpack.common");
const { merge } = require("webpack-merge");
const ESLintPlugin = require("eslint-webpack-plugin");

module.exports = merge(common, {
  mode: "development",
  devtool: "eval-cheap-module-source-map",
  devServer: {
    open: true,
    // 指定端口
    port: 9000,
    // 命令行中会显示打包的进度
    progress: true,
    // 开启热更新
    hot: true,
    // 是个很有趣的特性
    historyApiFallback: true,
    // 添加静态资源的引用，可以用数组
    // 这样原本没有被打包进去的内容也可以正确被引用
    contentBase: path.join(__dirname, "public"),
  },
  plugins: [new ESLintPlugin()],
  // extends: ["plugin:vue/recommended"],
});
