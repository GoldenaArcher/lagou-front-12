/*
尽可能还原 Promise 中的每一个 API, 并通过注释的方式描述思路和原理.
*/

/**
 * 1. Promise 是一个类，在执行这个类的时候，需要传递一个执行器进去，执行器回立即执行
 * 2. Promise 中有三种状态，分别是
 *      - fulfilled
 *      - rejected
 *      - pending, 走向 fulfilled or rejected
 *    一旦状态确定就不可更改
 * 3. resolve 和 reject func是用来更改状态
 *      new Promise((resolve, reject) => {
 *          resolve("success");
 *          reject("fail");
 *      });
 */

const PENDING = "pending"; // 等待
const FULFILLED = "fulfilled"; // 成功
const REJECTED = "rejected"; // 失败

class MyPromise {
  constructor(executor) {
    try {
      // add executor error wrapper
      // execute immediately
      executor(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }
  // store variables here
  status = PENDING;
  // store value after success, and reason after failure
  value = undefined;
  reason = undefined;

  // store async callbacks
  //   successCallback = undefined;
  //   failCallback = undefined;
  // changed from basic type to array to store multiple callbacks, which allow chaining of then methods
  successCallback = [];
  failCallback = [];

  // declare 2 properties, using arrow func to avoid `this` pointing issue
  // ensure `this` always points to myProse class
  // also need to update the status inside the arrow func
  // remember to check whether the status is pending or not, prevent altering data after execution
  resolve = (value) => {
    if (this.status !== PENDING) return;
    this.status = FULFILLED;
    this.value = value;
    // short circuit the code and execute stored callback
    // this.successCallback && this.successCallback(this.value);

    // change for chainning version
    while (this.successCallback.length) this.successCallback.shift()();
  };
  reject = (reason) => {
    if (this.status !== PENDING) return;
    this.status = REJECTED;
    this.reason = reason;

    // short circuit the code and execute stored callback
    // this.failCallback && this.failCallback(this.value);

    // change for chainning version
    while (this.failCallback.length) this.failCallback.shift()();
  };

  /**
   * 5. inside then function, checking for status is required
   *    something like: fulfilled ? success : fail
   * 6. both success and fail needs to have an param, one states for the value returned after success, the other is reason for failure
   */
  // promise.then(() => {}, () => {})
  then(successCallback, failCallback) {
    // option args
    successCallback = successCallback ? successCallback : (value) => value;
    failCallback = failCallback
      ? failCallback
      : (reason) => {
          throw reason;
        };

    //   need a immediate executable methods, so wrapped the motheds as a parameter
    // this allow value return for chainning then methods
    let promsie2 = new MyPromise((resolve, reject) => {
      // resolve initialize issue by creating a timeout
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            let x = successCallback(this.value);
            // compare the value of x: prim val or promise obj
            // - prim val: resolve it
            // - promise obj: check the value returned by promise obj, then decide to use resolve or reject
            // resolve(x);
            resolvePromise(promsie2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = failCallback(this.reason);
            // compare the value of x: prim val or promise obj
            // - prim val: resolve it
            // - promise obj: check the value returned by promise obj, then decide to use resolve or reject
            // resolve(x);
            resolvePromise(promsie2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else {
        // at this stage, the code will not execute async code
        // the else block will execute async code
        // which the status is pending
        // by storing the success and fail callbacks

        // change code structure which allow chaining of then
        //   this.successCallback = successCallback;
        //   this.failCallback = failCallback;
        this.successCallback.push(() => {
          setTimeout(() => {
            try {
              let x = successCallback(this.value);
              // compare the value of x: prim val or promise obj
              // - prim val: resolve it
              // - promise obj: check the value returned by promise obj, then decide to use resolve or reject
              // resolve(x);
              resolvePromise(promsie2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
        this.failCallback.push(() => {
          setTimeout(() => {
            try {
              let x = failCallback(this.reason);
              // compare the value of x: prim val or promise obj
              // - prim val: resolve it
              // - promise obj: check the value returned by promise obj, then decide to use resolve or reject
              // resolve(x);
              resolvePromise(promsie2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });
    return promsie2;
  }
  finally(callback) {
    return this.then(
      (value) => {
        return MyPromise.resolve(callback()).then(() => value);
      },
      (reason) => {
        return MyPromise.resolve(callback()).then(() => {
          throw reason;
        });
      }
    );
  }
  catch(failCallback) {
    return this.then(undefined, failCallback);
  }
  static all(array) {
    let result = [];
    let index = 0;
    return new MyPromise((resolve, reject) => {
      function addData(key, value) {
        result[key] = value;
        index++;
        if (index === array.length) {
          resolve(result);
        }
      }
      for (let i = 0; i < array.length; i++) {
        let current = array[i];
        if (current instanceof MyPromise) {
          // promise obj
          current.then(
            (value) => addData(i, value),
            (reason) => reject(reason)
          );
        } else {
          // prim val
          addData(i, array[i]);
        }
      }
    });
  }
  static resolve(value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise((resolve) => resolve(value));
  }
}

function resolvePromise(promsie2, x, resolve, reject) {
  // withoug async, there exists one issue:
  // ReferenceError: Cannot access 'promise2' before initialization
  if (promsie2 === x) {
    // self referencing issue
    // doesn't work with chaining, because each then will return a new promise obj
    return reject(
      new TypeError("Chaining cycle detected for promise #<Promise>")
    );
  }
  if (x instanceof MyPromise) {
    // promise obj
    x.then(resolve, reject);
  } else {
    // prim val
    resolve(x);
  }
}

module.exports = MyPromise;
