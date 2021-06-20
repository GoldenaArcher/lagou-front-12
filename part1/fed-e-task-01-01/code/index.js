const MyPromise = require("./MyPromise");

const promise = new MyPromise((resolve, reject) => {
  // the main thread will not for code to execute
  setTimeout(() => {
    // throw new Error("executor error");
    resolve("success");
  }, 2000);
  // reject("fail");
});

// function other() {
//   return new MyPromise((resolve, reject) => {
//     // resolve("other");
//     // reject("fail");
//   });
// }

promise
  .then(
    (val) => {
      console.log(val);
      // cannot return current returning value
      // manually cause error
      // throw new Error("then error");
      return 'aaa';
    },
    (reason) => {
      console.log("fail part");
      console.log(reason.message);
      return 10000;
    }
  )
  .then(
    (val) => {
      console.log(val, "v2");
    },
    (reason) => {
      console.log("error msg here");
      console.log(reason.message);
    }
  );

// let p1 = promise.then((val) => {
//   console.log(val);
//   // cannot return current returning value
//   return p1;
// });
// p1.then(
//   (val) => {},
//   (reason) => console.log(reason)
// );
