# Part1-2 作业

( 请在当前文件直接作答 )

## 简答题

### 1. 请说出下列最终执行结果，并解释为什么?

```javascript
var a = [];
for (var i = 0; i < 10; i++) {
  a[i] = function () {
    console.log(i);
  };
}
a[6]();
```

10

`var a` 是全局变量，所以毋庸置疑的会被提升。

在循环体内，每一个循环迭代都是在 `a[i]` 中存储了一个在输出台打印的函数，但是里面没有定义打印的值。

当调用 `a[6]()` 进行调用的时候，就进入了在迭代中创建的 closure，也就是说在 `function() { console.log(i) }` 中去访问 `for(var i)` 循环体中的变量 `i`。

`i` 在经历迭代后已经变成了 10，所以最终输出的结果就是 10.

### 2. 请说出此案列最终执行结果，并解释为什么?

```javascript
var tmp = 123;
if (true) {
  console.log(tmp);
  let tmp;
}
```

报错，尽管在外部已经声明了 `var tmp = 123;`，但是 ES6 中 花括号`{}` 会创建一个新的作用域，在这个作用域中使用的是 `let` 去定义的 `tmp`。

又因为 `let` 有 TDZ 的特性，会被 暂时性地区 锁定，所以在声明前使用会报错。

群里之前也讨论过了，ES6 中 let 和 const 到底会不会被 hoist。不过说真的，如果 JS 不会 hoist let 和 const，那么 runtime 怎么会知道这个到底是 let/const 还是未声明的 var?

```javascript
tmp; // 那么这里应该会被当做 var tmp 去对待
let tmp; // 假设let没有hoist
```

这个样子代码看起来会是下面的结构：

```javascript
var temp;
let tmp;
```

这样的报错信息应该是：

> var tmp;
>
> SyntaxError: Identifier 'tmp' has already been declared

而不是 `use before initialization` 吧。

毕竟直接使用 `x=10`，应该是会被当作下面的代码来执行的：

```javascript
var x;
x = 10;
```

是不会出现报错的情况。

### 3. 结合 ES6 语法，用最简单的方式找出数组中的最小值

```javascript
var arr = [12, 34, 32, 89, 4];
```

感觉 ES6 的话…… `...` Rest Operator?

```javascript
Math.max(...arr);
```

### 4. 请详细说明 var、let、const 三种声明变量的方式之间的具体差别

2 里面说了，主要就是 hoist 和 TDZ 的问题。

其他就是，如果声明时未赋值的话，`var` 和 `let` 会默认初始 `undefined`，而 `const` 直接会报错；`var` 和 `let` 可以在声明后修改值，而 `const` 不行，还是会报错。

### 5. 请说出下列代码最终输出结果，并解释为什么？

```javascript
var a = 10;
var obj = {
  a: 20,
  fn() {
    setTimeout(() => {
      console.log(this.a);
    });
  },
};
obj.fn();
```

### 6. 简述 Symbol 类型的用途

Symbol 具有唯一性，所以添加 Symbol 做 key 很适合用来重写别人已经封装好的 package，不会造成冲突的问题。

假设说已经封装好了一个 `add` 的函数，在不确定 package 内部有没有这个函数的情况下，直接在 prototype 上重写可能会造成一些引用上的问题。但是如果使用 Symbol 包装一下，`Symbol('add')`，因为 Symbol 有不可复制性，所以这里就相当于创建了一个独一无二的 id+add，这就不会引起不必要的混乱了。

另外就是，因为 Symbol 具有不可复制性，所以也可以拟态私有变量的使用。

这是因为在同样的作用域内，还可以引用到相同的 Symbol，一旦在另外的作用域，就算使用同样的语法去新建 Symbol，JavaScript 内部默认还是会新建一个不同的地址去保存 string description。

### 7. 说说什么是浅拷贝，什么是深拷贝？

shallow copy 只会 copy 第一层的数据，内部的引用不变；而 deep copy 会对整个数据的引用进行复制，内部所有的数据的引用地址都不一样了。

```javascript
// shallow copy
const arr = [
  {
    name: "test",
  },
];
const shallowCopy = [...arr];
shallowCopy.push({ name: "test2" });
console.log(arr.length); // 维持不变，还是1
console.log(shallowCopy.length); // 变成了2，新的值推进去了
// 但是，内部的引用还是一样的
shallowCopy[0].name = "changed";
console.log(arr[0].name === "changed"); // true
console.log(shallowCopy[0].name === "changed"); // true

// lodash的函数应该叫cloneDeep，记不清了，反正大概逻辑这样
const _ = require("lodash");
const deepClone = _.cloneDeep(arr);
deepClone[0].name = "same";
console.log(arr[0].name === "changed"); // true
console.log(deepClone[0].name === "changed"); // false
```

### 8. 请简述 TypeScript 与 JavaScript 之间的关系？

TS 是 JS 的超集，本质上来说 TS 想要运行还是得编译成为 JS。

但是在编写的过程中，因为 TS 引入了静态检查，所以用 TS 的写法写代码的话，必须要保证传入的数据类型是对的，否则不能通过静态检查。

JS 没有这么多局限，如果想要实现这种检查的话就要用 flow，不过我们的 React 项目就是靠写 prototype，具体执行怎么样全靠自觉……

### 9. 请谈谈你所认为的 typescript 优缺点

大项目 TS 肯定写起来舒服些，我真的是受够了一串串检查类型 `var?.property?.otherProperty?.val instanceof SOME_OBJ` 这种写法了……更别说之前项目没有配置好的时候连 optional chaining 都没法用，这种代码简直反人类：

```javascript
if (a && a.b && a.b.c && a.b.c.d) {
  if (a.b.c.d instanceof Object) {
    // do sth
  } else if (a.b.c.d instanceof Object2) {
    // do sth
  }
}
```

另外还有就是有些时候也不知道谁在哪里改了什么东西，有些必须要的主键就莫名其妙成了空值。这样还得再检查一下这个 **必要** 的主键是不是空值……

有静态检查写起来和跑起来都相当于有工具逼着你，这就是不用靠自觉性了。

缺点就是烦，项目小的时候可能架构还没讨论好、实现完毕呢，用 JS 就直接写完了……

### 10. 描述引用计数的工作原理和优缺点

**引用计数（reference computing）** 是另外一种没那么常用的垃圾回收机制。其基本思路是标记每一个变量被引用的次数，当这个函数被调用时，引用的次数 +1，当保存该值引用的值被其他的覆盖了，引用的次数 -1。最终当引用的次数为 0 的时候，就被认定可以安全地释放其内存，并且会在下次垃圾回收机制运行的时候释放其空间。

在互相引用的情况下，这个回收机制就会出现问题——引用计数永远不会为 0，这也代表着互相调用的内存永远不会被清空。

```javascript
const someSbject = {};
// ........
someSbject = null; // 完全切断变量与引用之间的关系
```

其优点就是快，实时性高（一直在检查，一旦引用数为 0 则立刻清理，中间停流的时间短），使用简单。

其缺点是无法回收循环引用的对象（引用数一直不会为零），时间开销大（一直在检查，花费的时间会很大）。

### 11. 描述标记整理算法的工作流程

标记整理算法是标记清楚算法的一种增强版，在初期的标记阶段的工作流程都是一样的，都会就对象进行遍历，然后对可达活动对象进行标记。

和标记清楚算法不一样的是，在清理阶段，标记整理算法会首先移动对象的位置，对其进行整理。将碎片化的空间整理到一起，起到可以空间的连续使用。最后，将散落在其他空间的非活动空间进行回收。

### 12.描述 V8 中新生代存储区垃圾回收的流程

首先，新生代内存区会将内存区分为两个等大的空间，当前正在使用的空间命名为 from，另一个空闲的空间命名为 to。

活动的空间存放于正在使用的空间，也就是 from。在标记整理的过程中，会将活动的空间从 from 移动到 to。

当 from 和 to 完成了移动后，就可以完成释放。

### 13. 描述增量标记算法在何时使用及工作原理

增量标记法(Incremental GC) 是 V8 引擎在清除老生代对象时所使用的一种性能优化的 GC 方法。

其工作原理时当 GC 在进行回收时，并不会长时间的阻碍程序的运行。在 Incremental GC 运行时，它会间断性地运行较短的时间段去进行 GC，因此对于用户来说并不会产生非常明显的体感。尽管使用 Incremental GC 会延长一点儿总体的 GC 运行时间，但是它能够有效的解决 GC 运行时的延迟问题，所以也不妨是一个不错的优化方案。
