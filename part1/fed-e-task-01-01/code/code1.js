// 将下面异步代码使用 Promise 的方法改进
// 尽量用看上去像同步代码的方式
// setTimeout(function () {
//   var a = "hello";
//   setTimeout(function () {
//     var b = "lagou";
//     setTimeout(function () {
//       var c = "I ♥ U";
//       console.log(a + b + c);
//     }, 10);
//   }, 10);
// }, 10);

const promise1 = new Promise((resolve, reject) => {
  setTimeout(resolve, 10, "hello");
});
const promise2 = new Promise((resolve, reject) => {
  setTimeout(resolve, 10, "lagou");
});

const promise3 = new Promise(function (resolve, reject) {
  setTimeout(resolve, 10, "I ♥ U");
});

Promise.all([promise1, promise2, promise3]).then((val) => {
  console.log(val.join(""));
});
