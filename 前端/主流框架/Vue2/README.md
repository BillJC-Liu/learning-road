# Vue 源码学习

### 1.什么是MVC MVVM
  - `MVC(Model-View-Conctrller)`：直观的架构模式，用户操作 -> View(负责展示，接收用户操作) -> Conctrller(业务逻辑处理) -> Model(数据持久化) -> 将结果返回给 View
  - `MVVM(Model-View-ViewModel)`：核心理念，数据双向绑定，也就是`viewModel`，`model`与`view`之间没有联系，但是通过`viewModel`进行交互，而且`model`与`viewModel`直接是双向的，因此是视图层的数据变化同时会修改数据源，数据源的变化也会立即响应给`view`

### 2.Vue的生命周期
![vue生命周期](static/images/lifecycle.png)
详解：https://www.jianshu.com/p/48d4d92255b7

### 3.Vue实例化过程
自行查看.xmind文件

### 4.$nextClick原理（异步宏任务还是异步微任务，什么情况下进行何种异步，判断顺序如何）
自行查看.xmind文件

### 6.Vue响应式原理 Object.defineProperty
可以参考下《你不知道的JavaScript》上卷书籍中的介绍
`Object.defineProperty`是`ES5`中一个无法 shim 的特性，这也就是 Vue 不支持 IE8 以及更低版本浏览器的原因。
它可以修改增删改对象上的一些属性，并且可以修改`Object`上的一些原始属性，返回该对象。
vue中对管理的状态进行了`getter/setter`的修改。

### 7.Vue中的VNode
### 8.Vue编译过程及原理

### Diff原理（如何将时间复杂度由O(n³)优化到O(n)）

### this.$listeners
### <component :is="" />
### 内容分发 <slot />  this.$slots