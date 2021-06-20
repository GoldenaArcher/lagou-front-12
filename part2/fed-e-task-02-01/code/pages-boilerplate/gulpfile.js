// 实现这个项目的构建任务
const { src, dest, parallel, series, watch } = require("gulp");

const loadPlugins = require("gulp-load-plugins");
const plugins = loadPlugins();

const del = require("del");
// 热更新功能
const browserSync = require("browser-sync");
const bs = browserSync.create();

const data = {
  menus: [
    {
      name: "Home",
      icon: "aperture",
      link: "index.html",
    },
    {
      name: "Features",
      link: "features.html",
    },
    {
      name: "About",
      link: "about.html",
    },
    {
      name: "Contact",
      link: "#",
      children: [
        {
          name: "Twitter",
          link: "https://twitter.com/w_zce",
        },
        {
          name: "About",
          link: "https://weibo.com/zceme",
        },
        {
          name: "divider",
        },
        {
          name: "About",
          link: "https://github.com/zce",
        },
      ],
    },
  ],
  pkg: require("./package.json"),
  date: new Date(),
};

// 样式编译
const style = () => {
  return src("src/assets/styles/*.scss", { base: "src" })
    .pipe(plugins.sass({ outputStyle: "expanded" }))
    .pipe(dest("temp"));
};

// 脚本编译
const script = () => {
  return src("src/assets/scripts/*.js", { base: "src" })
    .pipe(plugins.babel({ presets: ["@babel/preset-env"] }))
    .pipe(dest("temp"));
};

// 页面编译
const page = () => {
  // 只编译根目录下的html，不包含子目录的html，如 layout, partial 等
  return src("src/*.html", { base: "src" })
    .pipe(
      plugins.swig({
        data,
        defaults: {
          // 默认不缓存文件，可能会存在热更新失败问题
          cache: false,
        },
      })
    )
    .pipe(dest("temp"));
};

// 图片转换
const image = () => {
  return src("src/assets/images/**", { base: "src" })
    .pipe(plugins.imagemin())
    .pipe(dest("dist"));
};

// 字体转换
const font = () => {
  return src("src/assets/fonts/**", { base: "src" })
    .pipe(plugins.imagemin())
    .pipe(dest("dist"));
};

const compile = parallel(style, script, page, image, font);

// cv public下的文件
const extra = () => {
  return src("public/**", { base: "public" }).pipe(dest("dist"));
};

// 解决 node_modules 引用问题 和 压缩文件
const useref = () => {
  return (
    src("temp/*.html", { base: "temp" })
      .pipe(plugins.useref({ searchPath: ["temp", "."] }))
      // html css js 的压缩
      // 使用 if 判断是否是 js 文件，是的话就是用 uglify 去压缩
      .pipe(plugins.if(/\.js$/, plugins.uglify()))
      .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
      .pipe(
        plugins.if(
          /\.html$/,
          plugins.htmlmin({
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
          })
        )
      )
      // 为了防止文件的读写冲突，存入临时文件夹
      .pipe(dest("dist"))
  );
};

// 删除 dist 中的所有内容
const clean = () => {
  return del(["dist", "temp"]);
};

// 会调用写好的函数，因此要放在函数声明的后面
const serve = () => {
  // 监听所有的文件变化，都是之前写过的函数
  watch("src/assets/styles/*.scss", style);
  watch("src/assets/scripts/*.js", script);
  watch("src/*.html", page);
  watch(
    ["src/assets/images/**", "src/assets/fonts/**", "public/**"],
    bs.reload
  );

  bs.init({
    // 根目录，设置的是编译过后的目录
    server: {
      baseDir: ["temp", "src", "public"],
      // 对于项目中，/node_modules/ 是没有办法寻找到正确的路径的
      // 这里相对于增添一个路由，去寻找到正确的配置
      // 对于 /node_modules 的具体配置，后面会有
      routes: {
        "/node_modules": "node_modules",
      },
    },
    // 监听修改的文件，一单文件被更新，浏览器渲染页面就会同步被渲染
    files: "dist/**",
    // 启动时不跳出 browser sync 已经连接的消息
    notify: false,
    // 指定端口
    port: 2080,
  });
};

// 开发用的任务
const develop = series(compile, serve);

// 上线用的任务
// 1. 先用 series 进行对 dist 的删除，再调用 parallel 去分别执行任务
//    parallel 拆分的任务是为了分离 compile 和 其他的 的业务逻辑
// 2. 并行进行 compile 和 useref 任务
//    保证先编译完再压缩
// 3. 并行进行 编译+压缩，图片，字体和其他文件的写入过程
const build = series(
  clean,
  parallel(series(compile, useref), image, font, extra)
);

module.exports = {
  build,
  develop,
  clean,
};
