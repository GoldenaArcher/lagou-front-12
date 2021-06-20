#!/usr/bin/env node

// 设置环境变量的 文件头

const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");

// let files = [];

// function ThroughDirectory(Directory) {
//   fs.readdirSync(Directory).forEach((File) => {
//     const Absolute = path.join(Directory, File);
//     if (fs.statSync(Absolute).isDirectory()) return ThroughDirectory(Absolute);
//     else return files.push(Absolute);
//   });
// }

// console.log(ThroughDirectory(path.join(__dirname, "templates")));

inquirer
  .prompt([
    {
      type: "input",
      name: "name",
      message: "Project name",
    },
  ])
  .then((answers) => {
    // 根据用户提供的内容生成文件
    const tmplDir = path.join(__dirname, "templates");
    // 目标输出目录
    const destDir = process.cwd();

    // 读取模板目录下所有文件
    fs.readdir(tmplDir, (err, files) => {
      if (err) throw err;

      files.forEach((file) => {
        ejs.renderFile(path.join(tmplDir, file), answers, (err, res) => {
          if (err) throw err;

          fs.writeFileSync(path.join(destDir, file), res);
        });
      });
    });
  });
