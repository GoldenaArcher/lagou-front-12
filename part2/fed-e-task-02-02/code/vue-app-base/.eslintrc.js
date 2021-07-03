module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["plugin:vue/recommended", "airbnb-base"],
  parserOptions: {
    ecmaVersion: 12,
  },
  plugins: ["vue"],
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
