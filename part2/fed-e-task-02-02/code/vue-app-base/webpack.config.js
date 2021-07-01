const path = require("path");
const webpack = require("webpack");

const { VueLoaderPlugin } = require("vue-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "./",
  },
  devServer: {
    contentBase: "./public",
    watchContentBase: true,
    progress: true,
  },
  module: {
    rules: [
      // 解析Vue文件
      { test: /\.vue$/, loader: "vue-loader" },
      // 它会应用到普通的 `.js` 文件
      // 以及 `.vue` 文件中的 `<script>` 块
      {
        test: /\.js$/,
        loader: "babel-loader",
      },
      // 它会应用到普通的 `.css` 文件
      // 以及 `.vue` 文件中的 `<style>` 块
      {
        test: /\.css$/,
        use: ["vue-style-loader", "css-loader"],
      },
      // 对 less 文件进行处理
      {
        test: /\.less$/i,
        use: [
          // compiles Less to CSS
          "style-loader",
          "css-loader",
          "less-loader",
        ],
      },
      // 针对 png 图片进行处理
      {
        test: /\.png$/i,
        // 如果向上面一样直接使用 use: "file-loader"
        // 会出现图片资源为 "[object Module]" 的问题
        // 这是因为新版的 file-loader 自动开启了 ES模块
        // 手动关闭即可正确显示
        use: {
          loader: "file-loader",
          options: {
            esModule: false,
          },
        },
      },
    ],
  },
  plugins: [
    // 设置 webpack 所要的基础配置
    new webpack.DefinePlugin({
      BASE_URL: JSON.stringify("./"),
    }),
    // 请确保引入这个插件！
    new VueLoaderPlugin(),
    // 空的狗欧早寒素仅会生成一个 index.html，会引入合适的文件，但是入口DOM节点 app 不见了，所以需要其他的配置
    new HtmlWebpackPlugin({
      template: "public/index.html",
    }),
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [{ from: "public/favicon.ico", to: "./" }],
    }),
  ],
};
