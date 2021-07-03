const path = require("path");
const webpack = require("webpack");

const { VueLoaderPlugin } = require("vue-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  target: "web",
  entry: "./src/main.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
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
      // url-loader，针对图片的优化
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              // 这个上限是官方文档设立的，这里就不改了
              limit: 8192,
              // 同理，不设置为false打开的会是 esModule
              esModule: false,
            },
          },
        ],
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
  ],
};
