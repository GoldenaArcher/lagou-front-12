# Yeoman

脚手架的工作原理

## 目前存在的问题

目前这个 Javascript 的版本是根据学习视频过的进度，存在以下的问题：

无法读取文件夹中的内容。

即，项目结构存在这种情况是会报错的：

```bash
|- src
|  |- templates
|  |  |- other-fold # 这里会触发报错
|  |- index.js
```

还在赶作业，源码关于递归式读取文件部分注释掉了，还没继续改。

## 使用 nodejs 搭建脚手架

1. 新建一个目录，并初始化一个 package.json

   ```bash
   front> mkdir sample-cli
   front> cd .\sample-cli\
   yarn init v1.22.10nit --yes
   warning The yes flag has been set. This will automatically answer yes to all questions, which may have security implications.
   success Saved package.json
   Done in 0.10s.
   ```

2. 修改 package.json

   设置 cli 的入口文件

   ```json
   {
     "name": "sample-cli",
     "version": "1.0.0",
     "main": "index.js",
     "bin": "cli.js",
     "license": "MIT"
   }
   ```

3. 添加 cli.js 这个文件

   ```javascript
   #!/usr/bin/env node

   // 设置环境变量的 文件头

   console.log("cli start");
   ```

4. 依旧是使用 `yarn link` 将这个 node modules 关联到全局

   完成这一步就可以完成一个最基本的交互了：

   ```bash
   success Registered "sample-cli".
   info You can now run `yarn link "sample-cli"` in the projects where you want to use this package and it will be used instead.
   Done in 0.12s.
   sample-cli> sample-cli
   cli start
   ```

5. 具体业务 1：发起命令行交互

   交互使用的是 inquirer 这个依赖包，先安装依赖包：

   ```bash
   sample-cli> yarn add inquirer
   ```

   inquirer 提供了一个 prompt 的函数去进行命令行交互，其实现如下：

   ```javascript
    #!/usr/bin/env node

    // 设置环境变量的 文件头

    const inquirer = require("inquirer");

    inquirer
      .prompt([
        {
          type: "input",
          name: "name",
          message: "Project name",
        },
      ])
      .then((answers) => {
        console.log(answers);
      });

   ```

   和之前使用 Yeoman 的过程非常的相似，交互过程如下：

   ```bash
    sample-cli> sample-cli
    ? Project name project-name
    { name: 'project-name' }
   ```

6. 生成模板用的文件

   这一步应该也很熟了。

   现在根目录下创建 templates 文件夹，里面先设置一个模板案例
   templates/index.html，它所包含的代码为：

   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <meta http-equiv="X-UA-Compatible" content="IE=edge" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title><%= name %></title>
     </head>
     <body>
       <h1><%= name %></h1>
     </body>
   </html>
   ```

   后面又新建了一个 index.css，不过里面没什么内容，只是表示可以读取多个文件而已

7. 读取模板用的文件

   就是自行封装一个函数去读取 templates 文件夹下的文件，实现的代码为：

   ```javascript
   // 新增的引用
   const path = require("path");
   const fs = require("fs");
   // 上面的函数没有变化，就不放进来了
   then((answers) => {
     // 根据用户提供的内容生成文件
     const tmplDir = path.join(__dirname, "templates");
     // 目标输出目录
     const destDir = process.cwd();

     // 读取模板目录下所有文件
     fs.readdir(tmplDir, (err, files) => {
       if (err) throw err;

       files.forEach((file) => {
         console.log(file);
       });
     });
   });
   ```

   此时的输出结果为：

   ```bash
   sample-cli> sample-cli
    ? Project name s
    index.css
    index.html
   ```

   能够清晰的看出，输出的结果是相对路径

8. 通过模板引擎去写出文件

   如之前所使用的那样，这里的模板引擎是 ejs，安装方式如下：

   ```bash
   sample-cli> yarn add ejs
   ```

   随后修改代码，现在命令行输出通过模板引擎转化后的结果：

   ```javascript
   // 新增的引用
   const ejs = require("ejs");

   // 依旧是只修改了then部分的内容
   then((answers) => {
     // 读取模板目录下所有文件
     fs.readdir(tmplDir, (err, files) => {
       if (err) throw err;

       files.forEach((file) => {
         // 这里为新增内容
         ejs.renderFile(path.join(tmplDir, file), answers, (err, res) => {
           if (err) throw err;

           console.log(res);
         });
       });
     });
   });
   ```

   交互结果如下：

   ```bash
   sample-cli> sample-cli
    ? Project name test
    .body {
      background-color: #eee;
    }

    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>test</title>
    </head>
    <body>
        <h1>test</h1>
    </body>
    </html>
   ```

   可以看到 HTML 文件中的模板引擎部分 `<%= name %>` 已经被顺利的转义成了命令行提供的数据，所以这时候只差最后一步——写出文件。

9. 写出文件

   这里只需要将 `console.log()` 修改掉即可：

   ```javascript
   // 其余不变
   files.forEach((file) => {
     ejs.renderFile(path.join(tmplDir, file), answers, (err, res) => {
       if (err) throw err;

       // 修改这里
       fs.writeFileSync(path.join(destDir, file), res);
     });
   });
   ```

10. 最终测试

    ```bash
    sample-cli> cd ..
    yeoman> mkdir test-cli2
    yeoman> cd .\test-cli2\
    test-cli2> sample-cli
    ? Project name d
    ```

    输出结果为：

    <img src="https://img-blog.csdnimg.cn/20210617032011186.png" width="800">
