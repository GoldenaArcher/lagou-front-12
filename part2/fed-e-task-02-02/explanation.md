# 说明文档

配置的说明文档

## 项目分析

<img src="https://img-blog.csdnimg.cn/20210628205328609.png">

结构如下，需要编译的文件有 vue, less 和 JavaScript，需要压缩的文件有打包后的 JavaScript 和 HTML 文件。

**注\***：这个项目是一个使用 vue-cli 创建的初始项目，只不过移除了脚手架中自动打包的部分。

## 实现基础功能

这一部分主要是实现一些基础功能，这个项目已经是一个初始化好了的 node 项目，否则需要使用 `init` 命令去进行初始化。

### 安装 webpack 和 webpack-cli

```bash
D:\\vue-app-base>npm i webpack webpack-cli -D
```

`i` 是 install 的缩写，`-D` 是 `--save-dev` 的缩写，这样就将 webpack 和 webpack-cli 以开发依赖安装好了。

查看 `package.json` 文件，就会发现 devDependiencies 已经更新：

```json
{
  "devDependencies": {
    "webpack": "^5.41.0",
    "webpack-cli": "^4.7.2"
  }
}
```

这时候可以新添一条脚本命令让 npm 去运行 webpack：

```json
{
  "script": {
    "build": "webpack"
  }
}
```

这个时候尝试在命令行运行 `npm run build` 会得出大量的报错结果，但是这可以证明命令可以正常被运行。

```bash
D:\\vue-app-base>npm run build

> vue-app-base@0.1.0 build D:\\vue-app-base
> webpack

assets by status 0 bytes [cached] 1 asset

WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value.
Set 'mode' option to 'development' or 'production' to enable defaults for each environment.
You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/configuration/mode/

ERROR in main
Module not found: Error: Can't resolve './src' in 'D:\\vue-app-base
# 省去大量报错信息
webpack 5.41.0 compiled with 1 error and 1 warning in 163 ms
```

### 添加配置文件

最后在根目录下新建 `webpack.config.js` 作为 webpack 的入口，并且套入模板，对打包模式、入口和出口文件进行配置。

webpack 的配置文件可以导出一个对象，通过导出对象的属性就可以完成相应的配置选项。

```javascript
// npm原有的模块
const path = require("path");

module.exports = {
  // 入口文件
  entry: "./src/main.js",
  // 导出的部分
  output: {
    // 导出的文件名
    filename: "bundle.js",
    // 导出的文件名会放置的路径
    path: path.resolve(__dirname, "dist/"),
  },
};
```

这个时候再去运行 `npm run build`，会得出下面的结果：

```bash
D:\\vue-app-base>npm run build

> vue-app-base@0.1.0 build D:\\vue-app-base
> webpack

assets by status 4.16 KiB [cached] 1 asset
runtime modules 718 bytes 3 modules
cacheable modules 770 bytes
  ./src/main.js 169 bytes [built] [code generated]
  ./src/App.vue 537 bytes [built] [code generated] [1 error]
  ./src/style.less 64 bytes [built] [code generated] [1 error]
# 省略掉一堆报错信息
webpack 5.41.0 compiled with 4 errors and 1 warning in 216 ms
```

这次调出了 4 个 errors 和 1 个 warning，这是件好事儿，至少把所有的报错消息一个个的列了出来，这样也有可以开始 debug 的点了。最怕的不是报错信息多，而是报错信息没有头绪，不知道从哪开始。

webpack 给出了项目中的几个问题，分别是：

- <font color=yellow>**WARNING**</font> in **configuration**

  这个是说 mode 没有设置，会默认以生产环境进行开发

- <font color="red">**ERROR**</font> in **./src/App.vue 1:0**

  这个提示就很明显了，webpack 说：

  > **You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file.**

  需要一个 Vue 的 loader 去解决问题

- <font color="red">**ERROR**</font> in **./src/main.js 1:0-21**

  这个问题应该也是一样的，具体报错信息如下：

  ```bash
  Module not found: Error: Can't resolve 'vue' in 'D:\\vue-app-base\src'
  ```

- <font color="red">**ERROR**</font> in **./src/style.less 1:0**

  这个问题是一样的，也是缺少 loader：

  > **You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file.**

- <font color="red">**ERROR**</font> in **bundle.js from Terser**

  这个问题是属于 output 文件的问题了，先解决上面打包的问题，再看看这个问题会不会出现

### mode 的问题

这个问题很好解决，现在这个阶段，暂时会修改 scripts 中的命令行参数，去设置成 development 这个开发模式：

```json
{
  "scripts": {
    "build": "webpack --mode=development"
  }
}
```

同样再运行 `npm run build`，就发现，报错信息居然少了一个：

```bash
webpack 5.41.0 compiled with 3 errors in 103 ms
```

最后一个 <font color="red">**ERROR**</font> in **bundle.js from Terser** 居然消失了。那也就是说，现在剩下的 3 个报错都是开发时的报错，那就可以着手准备开放的 loader 和 plugin 的实现了。

另外，这个时候虽然还报错，但是 dist 目录已经能够显示出来了，证明 webpack 至少运行过一遍，并且导出了打包文件——这次可以确认 webpack 的安装和基础配置都没有问题了：

<img src="https://img-blog.csdnimg.cn/2021062919511381.png" width="">

### vue loader 及相关

[vue loader](https://vue-loader.vuejs.org/zh/) 是 webpack 的插件，这里的配置也都是跟着官方文档实现的。

1. 安装 `vue-loader` 和 `vue-template-compiler`

   ```bash
   npm install -D vue-loader vue-template-compiler
   # 突然意识到 cannot find Vue 的错误是因为我没有下载 package.json 里面列举的 Vue
   # 于是重新做一次下载，将需要的依赖包下载好
   npm install
   ```

2. 按照官方文档的内容，重新编写 `webpack.config.js` 的内容

   ```javascript
   // 新增内容
   const { VueLoaderPlugin } = require("vue-loader");

   module.exports = {
     // 新增内容
     module: {
       rules: [{ test: /\.vue$/, loader: "vue-loader" }],
     },
     plugins: [new VueLoaderPlugin()],
   };
   ```

3. 继续跟着官方文档，下载和安装所需要的依赖以及重新编写 `webpack.config.js`

   ```bash
   # babel 负责解析 JavaScript
   npm install -D babel-loader @babel/core
   # 其他两个负责解析CSS
   npm install -D vue-style-loader css-loader
   # 这也是必须的插件，否则会报错
   # 官方文档里没有列出来，如果你那里出现不同的报错，一定要看报错信息
   npm i -D @vue/cli-plugin-babel
   ```

   ```javascript
   // 新增内容
   const { VueLoaderPlugin } = require("vue-loader");

   module.exports = {
     // module里面的东西为新增内容
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
       ],
     },
     plugins: [
       // 请确保引入这个插件！
       new VueLoaderPlugin(),
     ],
   };
   ```

4. 运行 `npm run build`，这时候就只剩下两个报错信息了，一个是 png 打包报错（缺少图片处理），一个是 less 打包报错（缺少 less）

### 解决 CSS 的加载

CSS 加载的内容是 webpack 官方提供的：[less-loader](https://webpack.js.org/loaders/less-loader/)，所以这里也会跟着步骤一步一步解决报错信息

1. 下载必须的依赖包

   ```bash
   # 这是 style-loader，是下面配置需要用到的
   npm install style-loader --save-dev
   # 这是 less 相关的内容
   npm install less less-loader --save-dev
   ```

2. 修改配置文件

   **注\***：这里官方文档用的是 loader，但是不知道为什么使用 loader 会报错，遂改为了 use。如果你用 use 会报错，那就试试看 loader。webpack 的版本变化可能会让使用变得非常困难……

   ```javascript
   module.exports = {
     module: {
       rules: [
         // 其他地方不变
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
       ],
     },
   };
   ```

3. 运行 `npm run build` 进行检查

   这次只剩下一个 png 的问题了

### 解决图片加载的问题

1. 下载对应的 loader，这里用的是 file-loader

   ```bash
   D:\\vue-app-base>npm i -D file-loader
   ```

2. 修改配置文件

   ```javascript
   module.exports = {
     output: {
       filename: "bundle.js",
       path: path.resolve(__dirname, "dist"),
       // 新增内容，修改路径，将其改为相对路径而不使用绝对路径
       publicPath: "./",
     },
     module: {
       rules: [
         // 省略其他的配置
         // 针对 png 图片进行处理
         {
           test: /\.png$/i,
           // 如果像上面一样直接使用 use: "file-loader"
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
   };
   ```

   **注\***：这里的 file-loader 有一些特殊的属性，为了能够正确的显示图片，一定要将 esModule 设置为 false

   这是由于 file-loader 版本的不同造成的，低版本环境下默认 esModule 是关闭的，所以可以正确显示。但是我现在使用的版本是 6.2，默认就是开启 esModule 的。当 esModule 开启的时候，图片引入的路径是 `"[object Module]"`，而不是 `src="./26bd867dd65e26dbc77d1e151ffd36e0.png"`。

3. 尝试打包

   终于没有任何错误信息了，看起来是已经打包成功。

   ```bash
   D:\\vue-app-base>npm run build

   > vue-app-base@0.1.0 build D:\\vue-app-base
   > webpack --mode=development

   asset bundle.js 566 KiB [emitted] (name: main)
   asset 26bd867dd65e26dbc77d1e151ffd36e0.png 6.69 KiB [emitted] [immutable] [from: src/assets/logo.png] (auxiliary name: main)runtime modules 2.04 KiB 6 modules
   modules by path ./node_modules/core-js/ 147 KiB
   modules by path ./node_modules/core-js/internals/*.js 85.2 KiB 114 modules
   modules by path ./node_modules/core-js/modules/*.js 62 KiB 36 modules
   modules by path ./src/ 16.1 KiB 20 modules
   modules by path ./node_modules/style-loader/dist/runtime/*.js 4.12 KiB 4 modules
   modules by path ./node_modules/vue-style-loader/lib/*.js 6.74 KiB
   ./node_modules/vue-style-loader/lib/addStylesClient.js 6.09 KiB [built] [code generated]
   ./node_modules/vue-style-loader/lib/listToStyles.js 671 bytes [built] [code generated]
   ./node_modules/vue/dist/vue.runtime.esm.js 222 KiB [built] [code generated]
   ./node_modules/vue-loader/lib/runtime/componentNormalizer.js 2.71 KiB [built] [code generated]
   ./node_modules/@babel/runtime/helpers/esm/typeof.js 726 bytes [built] [code generated]
   ./node_modules/css-loader/dist/runtime/api.js 1.75 KiB [built] [code generated]
   webpack 5.41.0 compiled successfully in 3548 ms
   ```

   并且也能看到打包的目录下出现了新的图片：

   <img src="https://img-blog.csdnimg.cn/20210630133935649.png" width="">

**注\***：如果图片比较小的情况下，可以使用 url-loader，这样可以减少 http 请求的数量。

随后，手动复制黏贴和修改了一下 index.html，看一下渲染结果：

<img src="https://img-blog.csdnimg.cn/20210630145008355.png" width="">

所有的内容都可以正常显示，可以开始静态资源的处理了。

### url-loader，图片的优化

1. 下载对应的 loader，这里用的是 file-loader

   ```bash
   D:\\vue-app-base>npm install url-loader --save-dev
   ```

2. 修改配置文件

   不过说起来，vue 的 logo 正好卡在 8kb 这个尺寸，所以这大概是有什么约定俗成的规矩的？

   **注意**，这里要将 file-loader 修改为 url-loader，而不能叠加使用 url-loader 和 file-loader 两个，原因是因为 url-loader 的 fallback 函数就是 file-loader，同时使用两个 loader 的话，url-loader 会对原本图片文件的路径进行 base64 的转换。这就会导致转换出来的图片不可见——转换的是图片路径，而非图片。

   具体的讨论在 url-loader 的一个 issue 里有：[url-loader is encoding path instead of image](https://github.com/webpack-contrib/url-loader/issues/43)。

   也算是踩了个雷学到了个知识点。

   ```javascript
   module.exports = {
     module: {
       rules: [
         {
           test: /\.png$/i,
           use: [
             {
               // 原本是 file-loader，这里要修改为 url-loader
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
   };
   ```

### 解决静态文件的加载

胜利的曙光已经近在眼前，下一步只需要解决静态资源的问题就好了。这里的静态资源指的是 public 下的 index.html 和 favicon.ico。首先需要将 public 下面的内容 cv 到 dist 下，随后还要处理一下 HTML 中的模板文件。

这里使用的插件是 htmlWebpackPlugin，这个也是 Vue 的原生项目中的提示：

```html
<title><%= htmlWebpackPlugin.options.title %></title>
```

具体的配置可以查看 github 上的说明：[
html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)

1. 下载安装插件

   ```bash
   D:\\vue-app-base>npm i -D html-webpack-plugin
   ```

2. 修改配置文件

   这里就是根据官方文档来修改配置了。

   **注\***：BASE_URL 是环境变量，所以需要使用 deinfeProperty 去设置

   ```javascript
   // 新导入的两个依赖
   const webpack = require("webpack");
   const HtmlWebpackPlugin = require("html-webpack-plugin");

   module.exports = {
     plugins: [
       // 设置 webpack 所要的基础配置
       new webpack.DefinePlugin({
         BASE_URL: JSON.stringify("./"),
       }),
       // 空的狗欧早寒素仅会生成一个 index.html，会引入合适的文件，但是入口DOM节点 app 不见了，所以需要其他的配置
       new HtmlWebpackPlugin({
         template: "public/index.html",
         favicon: "public/favicon.ico",
       }),
     ],
   };
   ```

   **注 2\***：新学到了一招，也可以直接在 html-webpack-plugin 里面直接设置：

   ```javascript
   new HtmlWebpackPlugin({
     template: "public/index.html",
     templateParameters: {
       BASE_URL: "/",
     },
   });
   ```

3. 运行 `npm run build` 打包

   此时的结果如下：

   <img src="https://img-blog.csdnimg.cn/20210630162319460.png" width="">

   可以看到 favicon.ico 也被打包好了，index.html 的内容如下：

   <img src="https://img-blog.csdnimg.cn/20210630162414851.png" width="">

   可以看到，标题(title), Logo 都已经被动态修改了，而且内容也可以正常渲染：

   <img src="https://img-blog.csdnimg.cn/20210630163125946.png" width="">

### 自动清除输出目录

现在每次编写还是会重写 dist 中的内容，虽然不会影响结果，但是可能会导致之前产出的文件遗留在文件夹中，导致不必要的浪费。这里会使用 clean-webpack-plugin 这个插件去解决这个问题，npmjs 的地址为：[clean-webpack-plugin](https://www.npmjs.com/package/clean-webpack-plugin)

**注\***：默认这个版本会将所有输出目录下的内容全都清空。

1. 下载安装插件

   ```bash
   npm install --save-dev clean-webpack-plugin
   ```

2. 修改配置

   这个配置改起来还是很快的，直接引用即可。

   ```javascript
   const { CleanWebpackPlugin } = require("clean-webpack-plugin");

   module.exports = {
     plugins: [
       // 前面的配置不变
       new CleanWebpackPlugin(),
     ],
   };
   ```

3. 运行 `npm run build` 打包

   我运行了一下成功了，接下来就修改另外一个问题了。

### 复制静态文件

之前在配置 html-webpack-plugin 这个插件的时候，我又加了一个 favicon.ico，然后就发现，Vue 项目原本就有一个 favicon.ico，这里又加了一个，就出现了重复代码：

<img src="https://img-blog.csdnimg.cn/20210630171444178.png" width="">

在上面调用 clean-webpack-plugin 的时候，我把原本的 favicon 配置去掉了，又出现图片没有被迁徙的问题。这里就找一个插件，进行静态资源的迁徙。

这里用的插件是在 webpack 官网上找到的一个插件：[copy-webpack-plugin](https://webpack.js.org/plugins/copy-webpack-plugin/)

1. 下载安装插件

   ```bash
   npm install copy-webpack-plugin --save-dev
   ```

2. 修改配置

   这里只需要迁徙 favicon.ico，所以就只设定了这一个文件，不过 copy-webpack-plugin 实际上可以迁徙单个文件，也可以迁徙整个文件夹

   ```javascript
   // 日常加引用
   const CopyPlugin = require("copy-webpack-plugin");

   module.exports = {
     plugins: [
       // 其余不变
       // 这里只迁徙了 favico.ico 这个文件
       new CopyPlugin({
         patterns: [{ from: "public/favicon.ico", to: "./" }],
       }),
     ],
   };
   ```

   这样就完成了对 favicon.ico 文件的迁徙

### 修改 package.json 中的 build

将 package.json 中的 build 修改一下：

```javascript
// 之前是development
"build": "webpack --mode=production",
```

## 使用 webpack-dev-server 开发服务器的部署

目前为止，我本地的热部署使用的是 VSCode 提供的插件：Live Server。但是，并不是所有的开发团队成员都会使用同样的开发软件，同样，也不能保证所有的成员都有一样的插件。因此，开发一个具有相同功能的服务器就是一件必须的事情了。

这里会使用 [webpack-dev-server](https://www.npmjs.com/package/webpack-dev-server)
去解决这个问题，webpack-dev-server 集成了一些自动化的功能，因此可以搞定自动编译、自动监听、自动刷新浏览器的功能。

1. 下载安装插件

   ```bash
   npm install webpack-dev-server --save-dev
   ```

2. 修改配置

   webpack-dev-server 会提供一个 dev-server 的 cli 程序，通过这个程序就可以开启一个服务器。这里会通过将这个命令写到 package.json 里面的 scripts 去节省一些事儿：

   ```json
   {
     "scripts": {
       "serve": "webpack serve --mode=development --open"
     }
   }
   ```

   其他的配置属性不变，只新增一个 serve 命令即可。

   现在开始配置 webpack.config.js，注意，为了提升效率， webpack-dev-server 是将文件保存在**缓存**中，而不会直接在磁盘中进行重写。

   在配置中其实可以将 `publicPath: "./"` 这一行注释掉，一来其实并不影响 production 的打包，二来没有办法正确的将所有的数据缓存起来，会影响 dev server 的情况。

   具体的配置如下：

   ```javascript
   module.exports = {
     // 这个还蛮重要的，不然不知道为什么热更新会失败
     target: "web",
     // 省略其他配置
     devServer: {
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
     // 省略其他配置
   };
   ```

   在配置完了 contentBase 之后，也就代表着可以在开发环境中取消使用 copy-plugin，这样在针对比较大的文件的时候——尤其是有些图片确实会比较大，就能够省去不少的时间。

   historyApiFallback 是一个还挺有趣的特性，它主要是提供了一个路径让服务器去调用，官方文档是这样说的：

   ```javascript
   module.exports = {
     //...
     devServer: {
       historyApiFallback: {
         rewrites: [
           { from: /^\/$/, to: "/views/landing.html" },
           { from: /^\/subpage/, to: "/views/subpage.html" },
           { from: /./, to: "/views/404.html" },
         ],
       },
     },
   };
   ```

   也就是说，当访问的路径与指定的路径 match 的时候，就会跳转到 to 中指定的页面。

3. 关于 html-webpack-plugin

   这个之前在做 production 环境配置的时候就已经折腾好了，这里不多赘述，这部分在 [[万字逐步详解]使用 webpack 打包 vue 项目（基础生产环境）](https://goldenaarcher.blog.csdn.net/article/details/118384770#t10) 已经有详细的配置说明了。

4. 修改点什么试试看结果

   从命令行就能看到，保存过后就会重新编译，这样热更新就完成了：

   <img src="https://img-blog.csdnimg.cn/20210701160102604.png" width="">

   最终效果：

   <img src="https://img-blog.csdnimg.cn/20210701165249744.png" width="">

## 添加 source map

添加 source map 是为了能够方便 debug，现在打开 chrome 中的 source，显示的代码是不可读的：

<img src="https://img-blog.csdnimg.cn/20210701170254546.png" width="">

如果是开发公共组件，在有些时候，直接提供打包好的 bundle 对其他的使用这个开源库的用户来说，就会有阅读困难的问题。所以，这里会加上添加 source map 的功能。

配置是内置的，只需要添加一行新的配置即可：

```javascript
module.exports = {
  // 其他不变
  devtool: "eval-cheap-module-source-map",
};
```

长试运行一下 `npm run build` 之后，就会看到打包出了一个新的文件：

<img src="https://img-blog.csdnimg.cn/20210701171718245.png" width="">

在使用 Live Server 启用了一个服务器后，再去打开打包后的 index.html，会有下面这样的提示跳出来：

<img src="https://img-blog.csdnimg.cn/20210701172128152.png" width="">

这就说明系统已经能够找到对应的源码，报错就可以直接定位到源码报错的地方。

选择 cheap-module-source-map 的原因很简单，它会将 webpack 打包好的模块按照 module 还原成源码，并且能够准确定位到报错的行。在正常的情况下，为了保证代码的可读性，每行代码在 80-120 个字符范围内的情况下，定位到行就已经够了。

另外，对于 React/Vue 来说，原生的 JavaScript 和二者的语法糖差异较大，很难从编译过后的 JavaScript 直接在脑中转换成对应框架的代码，所以这也是需要使用源码的原因。同理，在生产环境就应该使用 nosources/none 的选项，这样别人就比较难从编译过后的 JavaScript 了解到源码。

下面是来自 [webpack-Devtool](https://webpack.js.org/configuration/devtool/) 官网上列举的差别：

<table> <thead> <tr> <th>devtool</th> <th>performance</th> <th>production</th> <th>quality</th> <th>comment</th> </tr> </thead> <tbody> <tr> <td data-th="devtool"><span>(none)</span></td> <td data-th="performance"><span><strong>build</strong>: fastest<br><br><strong>rebuild</strong>: fastest</span></td> <td data-th="production"><span>yes</span></td> <td data-th="quality"><span>bundle</span></td> <td data-th="comment"><span>Recommended choice for production builds with maximum performance.</span></td> </tr> <tr> <td data-th="devtool"><span><strong><code>eval</code></strong></span></td> <td data-th="performance"><span><strong>build</strong>: fast<br><br><strong>rebuild</strong>: fastest</span></td> <td data-th="production"><span>no</span></td> <td data-th="quality"><span>generated</span></td> <td data-th="comment"><span>Recommended choice for development builds with maximum performance.</span></td> </tr> <tr> <td data-th="devtool"><span><code>eval-cheap-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: ok<br><br><strong>rebuild</strong>: fast</span></td> <td data-th="production"><span>no</span></td> <td data-th="quality"><span>transformed</span></td> <td data-th="comment"><span>Tradeoff choice for development builds.</span></td> </tr> <tr> <td data-th="devtool"><span><code>eval-cheap-module-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: slow<br><br><strong>rebuild</strong>: fast</span></td> <td data-th="production"><span>no</span></td> <td data-th="quality"><span>original lines</span></td> <td data-th="comment"><span>Tradeoff choice for development builds.</span></td> </tr> <tr> <td data-th="devtool"><span><strong><code>eval-source-map</code></strong></span></td> <td data-th="performance"><span><strong>build</strong>: slowest<br><br><strong>rebuild</strong>: ok</span></td> <td data-th="production"><span>no</span></td> <td data-th="quality"><span>original</span></td> <td data-th="comment"><span>Recommended choice for development builds with high quality SourceMaps.</span></td> </tr> <tr> <td data-th="devtool"><span><code>cheap-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: ok<br><br><strong>rebuild</strong>: slow</span></td> <td data-th="production"><span>no</span></td> <td data-th="quality"><span>transformed</span></td> <td></td> </tr> <tr> <td data-th="devtool"><span><code>cheap-module-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: slow<br><br><strong>rebuild</strong>: slow</span></td> <td data-th="production"><span>no</span></td> <td data-th="quality"><span>original lines</span></td> <td></td> </tr> <tr> <td data-th="devtool"><span><strong><code>source-map</code></strong></span></td> <td data-th="performance"><span><strong>build</strong>: slowest<br><br><strong>rebuild</strong>: slowest</span></td> <td data-th="production"><span>yes</span></td> <td data-th="quality"><span>original</span></td> <td data-th="comment"><span>Recommended choice for production builds with high quality SourceMaps.</span></td> </tr> <tr> <td data-th="devtool"><span><code>inline-cheap-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: ok<br><br><strong>rebuild</strong>: slow</span></td> <td data-th="production"><span>no</span></td> <td data-th="quality"><span>transformed</span></td> <td></td> </tr> <tr> <td data-th="devtool"><span><code>inline-cheap-module-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: slow<br><br><strong>rebuild</strong>: slow</span></td> <td data-th="production"><span>no</span></td> <td data-th="quality"><span>original lines</span></td> <td></td> </tr> <tr> <td data-th="devtool"><span><code>inline-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: slowest<br><br><strong>rebuild</strong>: slowest</span></td> <td data-th="production"><span>no</span></td> <td data-th="quality"><span>original</span></td> <td data-th="comment"><span>Possible choice when publishing a single file</span></td> </tr> <tr> <td data-th="devtool"><span><code>eval-nosources-cheap-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: ok<br><br><strong>rebuild</strong>: fast</span></td> <td data-th="production"><span>no</span></td> <td data-th="quality"><span>transformed</span></td> <td data-th="comment"><span>source code not included</span></td> </tr> <tr> <td data-th="devtool"><span><code>eval-nosources-cheap-module-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: slow<br><br><strong>rebuild</strong>: fast</span></td> <td data-th="production"><span>no</span></td> <td data-th="quality"><span>original lines</span></td> <td data-th="comment"><span>source code not included</span></td> </tr> <tr> <td data-th="devtool"><span><code>eval-nosources-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: slowest<br><br><strong>rebuild</strong>: ok</span></td> <td data-th="production"><span>no</span></td> <td data-th="quality"><span>original</span></td> <td data-th="comment"><span>source code not included</span></td> </tr> <tr> <td data-th="devtool"><span><code>inline-nosources-cheap-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: ok<br><br><strong>rebuild</strong>: slow</span></td> <td data-th="production"><span>no</span></td> <td data-th="quality"><span>transformed</span></td> <td data-th="comment"><span>source code not included</span></td> </tr> <tr> <td data-th="devtool"><span><code>inline-nosources-cheap-module-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: slow<br><br><strong>rebuild</strong>: slow</span></td> <td data-th="production"><span>no</span></td> <td data-th="quality"><span>original lines</span></td> <td data-th="comment"><span>source code not included</span></td> </tr> <tr> <td data-th="devtool"><span><code>inline-nosources-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: slowest<br><br><strong>rebuild</strong>: slowest</span></td> <td data-th="production"><span>no</span></td> <td data-th="quality"><span>original</span></td> <td data-th="comment"><span>source code not included</span></td> </tr> <tr> <td data-th="devtool"><span><code>nosources-cheap-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: ok<br><br><strong>rebuild</strong>: slow</span></td> <td data-th="production"><span>no</span></td> <td data-th="quality"><span>transformed</span></td> <td data-th="comment"><span>source code not included</span></td> </tr> <tr> <td data-th="devtool"><span><code>nosources-cheap-module-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: slow<br><br><strong>rebuild</strong>: slow</span></td> <td data-th="production"><span>no</span></td> <td data-th="quality"><span>original lines</span></td> <td data-th="comment"><span>source code not included</span></td> </tr> <tr> <td data-th="devtool"><span><code>nosources-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: slowest<br><br><strong>rebuild</strong>: slowest</span></td> <td data-th="production"><span>yes</span></td> <td data-th="quality"><span>original</span></td> <td data-th="comment"><span>source code not included</span></td> </tr> <tr> <td data-th="devtool"><span><code>hidden-nosources-cheap-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: ok<br><br><strong>rebuild</strong>: slow</span></td> <td data-th="production"><span>no</span></td> <td data-th="quality"><span>transformed</span></td> <td data-th="comment"><span>no reference, source code not included</span></td> </tr> <tr> <td data-th="devtool"><span><code>hidden-nosources-cheap-module-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: slow<br><br><strong>rebuild</strong>: slow</span></td> <td data-th="production"><span>no</span></td> <td data-th="quality"><span>original lines</span></td> <td data-th="comment"><span>no reference, source code not included</span></td> </tr> <tr> <td data-th="devtool"><span><code>hidden-nosources-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: slowest<br><br><strong>rebuild</strong>: slowest</span></td> <td data-th="production"><span>yes</span></td> <td data-th="quality"><span>original</span></td> <td data-th="comment"><span>no reference, source code not included</span></td> </tr> <tr> <td data-th="devtool"><span><code>hidden-cheap-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: ok<br><br><strong>rebuild</strong>: slow</span></td> <td data-th="production"><span>no</span></td> <td data-th="quality"><span>transformed</span></td> <td data-th="comment"><span>no reference</span></td> </tr> <tr> <td data-th="devtool"><span><code>hidden-cheap-module-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: slow<br><br><strong>rebuild</strong>: slow</span></td> <td data-th="production"><span>no</span></td> <td data-th="quality"><span>original lines</span></td> <td data-th="comment"><span>no reference</span></td> </tr> <tr> <td data-th="devtool"><span><code>hidden-source-map</code></span></td> <td data-th="performance"><span><strong>build</strong>: slowest<br><br><strong>rebuild</strong>: slowest</span></td> <td data-th="production"><span>yes</span></td> <td data-th="quality"><span>original</span></td> <td data-th="comment"><span>no reference. Possible choice when using SourceMap only for error reporting purposes.</span></td> </tr> </tbody> </table>

基本上来说，webpack 都已经显示了推荐用于不同情况下的不同环境，推荐使用哪种类型的 devtool 了，这里简单描述下：

- 带有 eval

  将模块代码放到 eval 函数中去执行，从而产生独立的作用域，再通过 source-url 去标注文件的路径

  只有 eval 的情况下，只能定位报错的文件

- 带有 source-map

  这会将代码转译成转换过的代码，可定位到具体的行和列

- 带有 cheap-source-map

  这会将代码转译成转换过的代码，代码会定位到行，但是不会定位到列

- 带有 module-source-map

  会将代码翻译成原生代码，并不会进行转译。即，未经过 loader 转译过后的代码

- 带有 inline-source-map

  将源码嵌入到 module 代码中去，webpack 推荐，这种情况**可能**在发布独立一个文件时发生

- hidden

  开发模式下看不见源码，但是源码会被一起打包

  比较适合用于开源项目

- nosources

  会显示行列信息，但是不会列出源码

  比较适合用于生产环境

所以说，正常来说我会选择使用 eval-cheap-module-source-map 作为开发环境，而 nosources/none 作为部署环境的代码。

下面是报错结果，我刻意在 Vue.js 中导入了一个不存在的文件：

```javascript
import HelloWorld from "./components/HelloWorld.vue";
// Error组件不存早，下面在源代码中是第10行
import Error from "./components/Error.vue";
```

浏览器中的报错结果如下：

<img src="https://img-blog.csdnimg.cn/20210702153146806.png" width="">

注意最后的 App.vue:formatted:11 这段，已经很好的提示错误所在了。

其实这里是强行刷新后产生的报错结果，出现报错的情况下 webpack 会自动停止热刷新，一直到错误修复为止。相似的错误信息也会出现在开启服务器的终端上。

## HRM 的开启

这里使用的是 **webpack5**，一定要确认版本，v4 和 v5 之间配置的差别似乎不太一样，二者的配置不一定能通用。

HRM，即 **H**ot **M**odule **R**eplacement，即模块热替换，也就是只编译更新过的模块的功能。

之前的配置，即：

```javascript
module.exports = {
  // 这一行说明运行环境是类似浏览器的环境
  target: "web",
  devServer: {
    // 开启热更新
    hot: true,
  },
};
```

其实已经开启了 HMR 和 Live Reloading：

<img src="https://img-blog.csdnimg.cn/2021070216502332.png" width="">

所以这一步相当于在之前的配置中已经完成了。

### 验证 HMR 效果

已知目录结构是这样的：

<img src="https://img-blog.csdnimg.cn/20210702190439202.png" width="">

并且依赖关系是：main 引用 App.vue, App.vue 引用 HelloWorld.vue，所以可以分别修改 main.js, App.vue, 和 HelloWorld.vue 去验证重新打包的大小，借此验证 HMR 是否更新成功。

- 更新 HelloWorld.vue

  ```bash
  assets by path *.js 2.54 MiB
    asset bundle.js 2.53 MiB [emitted] (name: main)
    asset main.598fea34c0d6bb419535.hot-update.js 17 KiB [emitted] [immutable] [hmr] (name: main)
  asset index.html 602 bytes [emitted]
  asset main.598fea34c0d6bb419535.hot-update.json 28 bytes [emitted] [immutable] [hmr]
  Entrypoint main 2.54 MiB = bundle.js 2.53 MiB main.598fea34c0d6bb419535.hot-update.js 17 KiB
  cached modules 863 KiB [cached] 264 modules
  runtime modules 26.8 KiB 14 modules
  javascript modules 9.46 KiB
  ```

  这里可以看到两组对比：

  - **main.598fea34c0d6bb419535.hot-update.js** 17 KiB

    热更新的部分的大小是 17KiB

  - **cached modules** 863 KiB [cached] 264 modules

    缓存的大小是 863Kib

  接下来还原 Helloworld.vue，保存后，再更新 App.Vue

- 更新 App.Vue

  ```bash
  assets by path *.js 2.54 MiB
    asset bundle.js 2.53 MiB [emitted] (name: main)
    asset main.815ce3af01699b267e86.hot-update.js 10.1 KiB [emitted] [immutable] [hmr] (name: main)
  asset index.html 602 bytes [emitted]
  asset main.815ce3af01699b267e86.hot-update.json 28 bytes [emitted] [immutable] [hmr]
  Entrypoint main 2.54 MiB = bundle.js 2.53 MiB main.815ce3af01699b267e86.hot-update.js 10.1 KiB
  cached modules 870 KiB [cached] 264 modules
  ```

  - **main.815ce3af01699b267e86.hot-update.js** 10.1 KiB

    热更新的部分的大小是 10.1KiB

    可以看到热更新的代码少了

  - **cached modules** 870 KiB [cached] 264 modules

    缓存的大小是 870Kib

    可以看到缓存的模块多了

    继续还原后再给 main.js 加个空格

- 更新 main.js

  ```bash
  assets by path *.js 2.53 MiB
    asset bundle.js 2.53 MiB [emitted] (name: main)
    asset main.fafa37f13c47741d83cd.hot-update.js 2.37 KiB [emitted] [immutable] [hmr] (name: main)
  asset index.html 602 bytes [emitted]
  asset main.fafa37f13c47741d83cd.hot-update.json 28 bytes [emitted] [immutable] [hmr]
  Entrypoint main 2.53 MiB = bundle.js 2.53 MiB main.fafa37f13c47741d83cd.hot-update.js 2.37 KiB
  cached modules 873 KiB [cached] 267 modules
  ```

  - **main.fafa37f13c47741d83cd.hot-update.js** 2.37 KiB

    能看出热更新的部分又少了

  - **cached modules** 873 KiB

    而缓存的模块又多了

这已经可以证明模块热替换的功能已经实现了。

## ESLint 设置

在 webpack 中，ESLint 的也是通过 loader 进行实现。理论上来说，在 JavaScript 文件被处理之前，应该通过 ESLint 的 loader 对 JavaScript 源码加上该有的信息。

**注\***：来自 webpack 官网：

> The loader `eslint-loader` will be deprecated soon, please use this plugin instead.

所以这里会使用对应的插件完成功能。

**注 2\***：使用 webpack 插件去运行时，ESLint 部分的运行失败，好像并不会影响项目的运行。

1. 安装插件

   这里也是根据报错信息来的，如果**不是** vue 项目，不需要下载 eslint-plugin-vue

   一路上报错……还挺多的

   ```bash
   # 要用 ESLint 的 webpack 插件肯定要先安装 ESLint
   npm install eslint --save-dev
   Usage
   # 安装对应的 webpack 插件
   npm install eslint-webpack-plugin --save-dev
   # 安装对应的 vue 版本
   npm install eslint-plugin-vue --save-dev
   # 又一个报错信息，提示需要 babel-eslint
   npm install babel-eslint --save-dev
   ```

   这些都安装完了之后，报错终于停止了，可以开始配置工作了。

2. 配置文件

   这一步还蛮烦的，一点一点来。

   1. 初始化 eslint

      执行命令 `npx eslint --init`

      ```bash
      C:\assignment\front\lagoufed-e-task\part2\fed-e-task-02-02\code\vue-app-base>npx eslint --init
      ? How would you like to use ESLint? ...
        To check syntax only
      > To check syntax and find problems
        To check syntax, find problems, and enforce code style
      ```

      第一步会有三个选项，第一个只会找语法错误，第二个会找语法错误和问题代码，如未使用的变量、不存在的变量等，第三个就是加上代码风格的检查，包括行太长，缩进之类的问题。

      这里选择第三个，也检查代码风格

      现在是第二个问题：

      ```bash
      ? What type of modules does your project use? ...
      > JavaScript modules (import/export)
        CommonJS (require/exports)
        None of these
      ```

      这里使用的时候 vue，不在二者之间，所以选择 None

      然后是第三个问题：

      ```bash
      ? Which framework does your project use? ...
      > React
        Vue.js
        None of these
      ```

      这里用的是 Vue，就选 Vue 了

      第四个问题：

      ? Does your project use TypeScript? » No / Yes

      这里没有用 TypeScript，选择 No

      第五个问题：

      ```bash
      ? Where does your code run? ...  (Press <space> to select, <a> to toggle all, <i> to invert selection)
      √ Browser
      √ Node
      ```

      这里虽然看不清楚，但是 Browser 和 Node 的 √ 的颜色其实不太一样。

      是个网页项目，选择 Browser 即可。

      第六个问题：

      ```bash
      ? How would you like to define a style for your project? ...
      > Use a popular style guide
        Answer questions about your style
        Inspect your JavaScript file(s)
      ```

      第一个选项就是用主流风格，第二个就是它会提示问题，然后自动生成，最后选项就是根据 JavaScript 文件自动生成。

      我想躺不想努力了，用市面上现成的风格。

      第七个问题：

      ```bash
      ? Which style guide do you want to follow? ...
      > Airbnb: https://github.com/airbnb/javascript
        Standard: https://github.com/standard/standard
        Google: https://github.com/google/eslint-config-google
        XO: https://github.com/xojs/eslint-config-xo
      ```

      可恶……居然没有 Vue 的选项，那就用 Airbnb 吧(React 项目中用 Airbnb 习惯了)。

      第八个问题：

      ```bash
      ? What format do you want your config file to be in? ...
      > JavaScript
        YAML
        JSON
      ```

      配置文件的类型，盲选 JavaScript。

      第九个问题：

      ```bash
      Checking peerDependencies of eslint-config-airbnb-base@latest
      The config that you've selected requires the following dependencies:

      eslint-plugin-vue@latest eslint-config-airbnb-base@latest eslint@^5.16.0 || ^6.8.0 || ^7.2.0 eslint-plugin-import@^2.22.1
      ? Would you like to install them now with npm? » No / Yes
      ```

      问你要不要安装对应的插件……当然……

   2. 修改.eslintrc.js

      ```javascript
      module.exports = {
        extends: [
          // 这里原本是essential，改成了recommended
          "plugin:vue/recommended",
          "airbnb-base",
        ],
        rules: {
          // 搞定换行符的问题，windows和unix的换行符不一样，所以这个可能会爆出大量的错误，尤其是开发设备不统一的情况下
          "linebreak-style": [
            "error",
            process.platform === "win32" ? "windows" : "unix",
          ],
          // Disallow self-closing on HTML void elements 的问题
          "vue/html-self-closing": [
            "error",
            {
              html: {
                void: "always",
                normal: "never",
                component: "always",
              },
              svg: "always",
              math: "always",
            },
          ],
          // XXX should be on a new line 问题
          "vue/max-attributes-per-line": [
            // 修改警告等级
            "warn",
            {
              // 单行时设置每行的上限为3个
              singleline: 3,
              // 多行的配置
              multiline: {
                // 多行的属性上限
                max: 1,
                // 允许第一行可以设置属性
                allowFirstLine: false,
              },
            },
          ],
          // 修改 unused 和 quotes 的警告等级
          "no-unused-vars": ["warn"],
          quotes: ["warn"],
        },
      };
      ```

3. 代码测试

   最后使用 `npx run src/App.vue` 的运行结果：

     <img src="https://img-blog.csdnimg.cn/20210703231023580.png" width="">

   unused var 是我想要看到的结果，single quote 这个引号问题可以搭配 prettier 这种工具去进行自动修正。

   同时使用 `npm run serve` 也能看到 ESLint 抛出异常，这也可以证明 ESLint 的配置已经成功了。

4. 对 package.json 的补充

   补充一下 lint 脚本：

   ```json
   {
     "script": {
       "build": "webpack --config webpack.prod.js",
       "lint": "eslint **/*.vue"
     }
   }
   ```

   **注\***：如果直接运行 `npm run lint`，并且文件中有错误信息的话，npm 会抛出错误异常：

   ```bash
   npm ERR! code ELIFECYCLE
   npm ERR! errno 1
   npm ERR! vue-app-base@0.1.0 lint: `eslint **/*.vue`
   npm ERR! Exit status 1
   npm ERR!
   npm ERR! Failed at the vue-app-base@0.1.0 lint script.
   npm ERR! This is probably not a problem with npm. There is likely additional logging output above.
   ```

   在 eslint 一个 issue 中也有讨论过这个问题：[When running eslint with npm script, npm throws error. #7933](https://github.com/eslint/eslint/issues/7933#:~:text=You%20get%20the%20npm%20error%20because%20when%20your,earlier%20script%20exits%20with%20a%20non-zero%20exit%20code.)，杰伦就是，这件事情是正常的。因为程序运行有异常，ESLint 抛出了一场又被 npm 所捕获，所以最终以 1 退出运行，这就会造成报错。

   试了一下讨论中说可以这么修改：`"lint": "eslint app/;exit 0"`，最终报错，无法使用，唯一成功的就是修改运行时后的脚本，将运行命令改为：`npm run lint -s`，这样的做法其实是 silent(安静) 报错信息，隐藏报错信息而已。如果个人看的不舒服可以使用后者去解决，不过就说一下，这不代表 ESLint 运行失败——所有的错误异常都显示了，这只是程序的正常处理逻辑。

## 分离环境

是时候将 webpack 的 _生产环境_ 和 _开发环境_ 分离开来了。从运行结果来说，原本打包的代码可能只有 100KB+，但是配上 Source Map 之后已经到了 1M 多。并且，生产环境并不需要 dev server，也不需要 Source Map，这些冗余的代码无异于会让上线的代码变得更“重”，从而影响访问的效率。

**注\***：还有一个选择是使用环境变量去判断，然后在同一个文件内对配置进行修改,这个做法也很简单，如：

```javascript
module.exports = (env, argv) => {
  const config = {
    // ...省略众多基础
  };
  if (env === "production") {
    config.mode = "production";
    config.devtool = false;
    config.plugins = [
      // 展开操作符
      ...config.plugins,
      // 新的 plugins
    ];
  }

  return config;
};
```

这里选择的方式是通过分割不同的配置文件，去对不同的环境进行适配。这种情况下，会有一个开发配置，生产配置，和公共配置，三个配置文件。

### 环境分析

结合上一篇的 production build 和这一篇的开发环境，分析一下两个版本可以共用的部分，以及两个版本独有的部分。

### 共用配置

首先，所有的 module 的部分，也就是所有的 loaders 都是需要的，毕竟需要依赖这些 loaders 去解析文件，同理，vue-loader-plugin 和 html-webpack-plugin 也是必须的。

再有，target 和 entry 也是一致的，毕竟这是一个基于 Vue 的 SPA。

至于 output，这个就看项目了，有些项目会分别在 production 和 development 指定不同的文件夹去进行编译，但是这里为了方便起见，用同一个 output 问题也不大。

所以 webpack.common.js 的配置就是下面这样的：

```javascript
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
```

### 生产配置

因为需要覆盖掉 plugins 的一些属性，这里会使用一个名为 webpack-merge 的依赖包去 merge 插件的数组。它的优势在于可以让开发者专注编写对应环境所需要的配置即可，这个插件自己内部会完成不同配置之间的 merge。

1. 安装 webpack-merge
   **注\***：使用 webpack-merge 也要注意版本之间的区别，用法可能会有些微不同。

   安装方式依旧是用 npm：

   ```bash
   C:\assignment\front\lagoufed-e-task\part2\fed-e-task-02-02\code\vue-app-base>npm i -D
   webpack-merge
   ```

2. 新建/修改 webpack.prod.js

   这就是生产模式的代码，主要新增了 mode，以及将原本没有的插件加了回来

   完整源码如下：

   ```javascript
   const common = require("./webpack.common");
   const { merge } = require("webpack-merge");

   const { CleanWebpackPlugin } = require("clean-webpack-plugin");
   const CopyPlugin = require("copy-webpack-plugin");

   module.exports = merge(common, {
     mode: "production",
     plugins: [
       new CleanWebpackPlugin(),
       new CopyPlugin({
         patterns: [{ from: "public/favicon.ico", to: "./" }],
       }),
     ],
   });
   ```

3. 修改 package.json

   这里只要修改一行代码即可，就是找到 script 下面的那部分，将正确的 webpack 配置文件路放到命令中去：

   ```json
   {
     // 其它不变
     "scripts": {
       "build": "webpack --config webpack.prod.js"
     }
   }
   ```

4. 运行测试没有问题

### 开发配置

这里主要就是配置一下 devtool 和 devServer 的配置，也是使用 webpack-merge 去进行操作

1. 新建/修改 webpack.dev.js

   ```javascript
   const path = require("path");
   const common = require("./webpack.common");
   const { merge } = require("webpack-merge");

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
   });
   ```

2. 修改 package.json

   方法一样

   ```json
   {
     // 其它不变
     "scripts": {
       "serve": "webpack serve --config webpack.dev.js"
     }
   }
   ```

3. 同样别忘了测试

最后一步就是删除多余的 webpack.config.js，也就是最初建立的配置文件。

## 功能优化

一些可以提高 webpack 打包性能的配置，具体的链接可以查看 [Tree Shaking](https://webpack.js.org/guides/tree-shaking/)，目前下面列举的属性在生产环境下都是默认开启的。

webpack 在官网上列举了几个开发环境下配置没什么意义的插件/功能，这里列举一下，将来避免在开发环境使用：

- TerserPlugin
- [fullhash]/[chunkhash]/[contenthash]
- AggressiveSplittingPlugin
- AggressiveMergingPlugin
- ModuleConcatenationPlugin

### 不导出死代码

会在 production 模式下自动开启，它不会将未被引用的 dead code 打包近项目中，这个功能又称 tree shaking

在其他环境下，可以通过 optimization 进行配置：

```javascript
modules.export = {
  // 其他配置不变
  optimization: {
    // 字面意思就是：只 export 使用的代码
    usedExports: true,
  },
};
```

### 其他模式下增添代码压缩功能

有需要的话——例如说新增配置与 production 相比更像 development 的 uat 环境之类的——可以使用，实现方法如下：

```javascript
modules.export = {
  // 其他配置不变
  optimization: {
    // 其他配置不变
    // 最小化
    minimize: true,
  },
};
```

### 合并模块

即 scope hoisting 功能，这是一个从 webpack3 开始就退出来的一个特性，可以将几个模块打包到一个文件中去，从而进一步减少文件打包的体积。这个功能在生产环境下默认开启，在其他环境下的开启方法如下：

```javascript
modules.export = {
  // 其他配置不变
  optimization: {
    // 其他配置不变
    // 合并模块
    // 设置为 false 可以重写 mode: production 中的默认设置
    concatenateModules: true,
  },
};
```

在 Vue 的项目中，应该会另外实现对于 concatenateModules 功能。一来打包出来的代码其实还是在一个模块里的，二来毕竟这个功能只能用于 ES6 模块，以下是来自 webpack 的说明：

> Keep in mind that this plugin will only be applied to ES6 modules processed directly by webpack. When using a transpiler, you'll need to disable module processing (e.g. the modules option in Babel)

大意为：

> 注意这个模块只会被应用于被 webpack 直接处理的 ES6 模块。当使用编译器器是，需要禁用模块处理，如：babel 中的 modules 功能

而 Vue 的代码肯定是要通过 babel 被编译的，而 babel 现在应该是默认开启了对 ESModule 的支持。

### 代码分割

**注\***：此方法未经过验证。

目的就是为了分包和做到按需加载，有效的减少代码的大小。

这个项目其实没有什么特别好的展示方法，因为只有三个组件，并且存在彼此的依赖关系，不过这里还是会稍微带一下，可以之后再去看。

这里主要的核心概念是在 vue 的 router 组件中使用 webpack 提供的 `require.ensure()` 去做到按需加载。

`require.ensure()` 的语法如下：

```javascript
require.ensure(
  dependencies: String[],
  callback: function(require),
  errorCallback: function(error),
  chunkName: String
)
```

大概方法如下：

```javascript
const routes = [
  {
    path: "/",
    name: "index",
    component: (resolve) =>
      require.ensure([], () => resolve(require("./views"))),
  },
  {
    path: "/otherComp",
    name: "other compoment",
    component: (resolve) =>
      require.ensure([], () => resolve(require("./views/otherComponent/"))),
  },
  // 差不多的用法
];
```

**注\***：除了 webpack 提供的 `require.ensure()` 之外其实还有其他的方法，不过这里主要还是注重 webpack 相关的学习，所以使用的是 webpack 提供的功能。

### 魔法注释

**注\***：此方法未经过验证。

这是让打包后的文件显示文件名的方法，如果文件名相同的将会被打包在一起。

大概方法如下：

```javascript
const routes = [
  {
    path: "/",
    name: "index",
    component: (resolve) =>
      require.ensure([], () => resolve(require("./views"), "index")),
  },
  {
    path: "/otherComp",
    name: "other compoment",
    component: (resolve) =>
      require.ensure([], () =>
        resolve(require("./views/otherComponent/"), "otherComp")
      ),
  },
  // 差不多的用法
];
```

### 提取 CSS 文件

如果 CSS 的文件体积不是很大，那么直接将 CSS 嵌入到 modules 中说不定运行速度会更快一些——毕竟少了一次请求，还有请求头之类的数据传输。

当然，这里是做功能展示，所以就拆分了——这一步会将 CSS 提取到一个单独的文件中去，然后通过 link 的方式进行引用。

这里依旧会使用插件：mini-css-extract-plugin，去完成这个功能。

1. 下载插件

   ```bash
   npm install --save-dev mini-css-extract-plugin
   ```

2. 使用插件

   这里依旧会选择在生产环境下使用这个插件，具体的配置如下：

   ```javascript
   // 新的引用
   const MiniCssExtractPlugin = require("mini-css-extract-plugin");

   module.exports = merge(common, {
     // 新增对CSS的处理，由原本的行内注释改为新增一个CSS文件
     module: {
       rules: [
         {
           test: /\.less$/i,
           use: [
             // style-loader 不需要了
             // "style-loader",
             MiniCssExtractPlugin.loader,
             "css-loader",
             "less-loader",
           ],
         },
       ],
     },
     plugins: [
       // 新增插件
       new MiniCssExtractPlugin(),
     ],
   });
   ```

3. 运行结果

   依旧是使用 `npm run build` 去执行操作，最后能够发现输出的结果多了一个 css 文件：

   <img src="https://img-blog.csdnimg.cn/20210703164824433.png" width="">

   看起来优化到这里可以结束了，但是当我打开 main.css 一看，这才发现，压缩没做：

   <img src="https://img-blog.csdnimg.cn/20210703165425240.png" width="">

   回顾一下，webpack 可以直接对 JavaScript 进行处理，这也就意味着对 CSS 和 HTML 的处理需要依赖其他的 _插件(plugins)_ 和 _加载器(loaders)_。

   换言之，这里需要对 CSS 进行另外的处理。

### 压缩 CSS 文件

这里其实是有两个选项，分别对应两个版本：

- webpack v4

  optimize-css-assets-webpack-plugin

- webpack v5

  css-minimizer-webpack-plugin

这里的 webpack 的版本是 v5，所以会选择用 css-minimizer-webpack-plugin。

1. 下载插件

   ```bash
   npm install css-minimizer-webpack-plugin --save-dev
   ```

2. 使用插件

   这个插件的使用还……有点意思，配错了容易导致其他 optimization 优化失效，具体配置为：

   ```javascript
   // 新增引用
   const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

   module.exports = merge(common, {
     // 其他配置不变
     optimization: {
       // 注意这个 '...'
       // 它是必须的，并且只能用在 webpack v5 以上
       // 不使用这个 '...' 会导致其他的优化失败
       minimizer: ["...", new CssMinimizerPlugin()],
     },
   });
   ```

3. 运行结果

   可以看到，与只使用了 mini-css-extract-plugin 后的结果不一样，使用了 css-minimizer-webpack-plugin 后，css 已经被压缩了：

   <img src="https://img-blog.csdnimg.cn/20210703171103423.png" width="">

### Hash 输出文件

这是为了客户端缓存进行了优化而使用的功能，一单文件名被 hash 了之后，那么在客户端就可以保存相对而言比较长的时间，而又不用担心更新的问题——新的文件名代表新的请求。

这个配置可以在这里找到：[Avoid Production Specific Tooling](https://webpack.js.org/guides/build-performance/#avoid-production-specific-tooling)，总共有三个选项：

- [fullhash]

  这里的 fullhash 对应的应该就是 v4 的 hash，毕竟看起来结果是一样的：

  <img src="https://img-blog.csdnimg.cn/20210703175302755.png" width="">

  fullhash 指的是每次 build 的时候，如果任何内容有所变动，都会重新生成一个。 hash 值，但是所有文件的 hash 是一样的

- [chunkhash]

  以 chunk 为级别进行重新打包，这种情况下，每个 chunk 的 hash 值都是一样的。这个项目上看不出什么差别，不过如果使用了动态路由，那么每个 router 中引进的 chunk 都是不一样的，这时候就会生成不同的 hash 值。

  同样，只有对应的 chunk 发生了变动，在重新打包的时候，因修改过的 chunk 而生成的文件名就会发生变动。

- [contenthash]

  这个就是以文件为级别重新进行打包，如果文件产生了变动，那么对应的文件就会生成一个新的 hash 值。

  如下图就能看出来，css 和 js 文件有两个不同的 hash 值：

  <img src="https://img-blog.csdnimg.cn/20210703180302728.png" width="">

webpack 官网讲的不是很细致，这里面的解释来自于: [Webpack 4: hash and contenthash and chunkhash, when to use which?](https://stackoverflow.com/a/59197260/8851585)

修改过的代码在这里：

```javascript
module.exports = merge(common, {
  // 其余不变
  output: {
    // 其余不变
    filename: "[name]-[contenthash:8].bundle.js",
  },
  plugins: [
    // 其余不变
    new MiniCssExtractPlugin({
      filename: "[name]-[contenthash:8].bundle.css",
    }),
  ],
});
```

**注\***：`contenthash:8` 中 `:[num]` 是用来指定生成既定长度的 hash 值，如 `:8` 就是 8 位长度。默认好像是 20
