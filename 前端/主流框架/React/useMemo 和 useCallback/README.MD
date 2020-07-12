### useMemo useCallback 的作用
  在class形式创建的组件下，react中，性能的优化点在于：
  1. 调用setState，就会触发组件的重新渲染，无论前后的state是够不同
  2. 父组件更新，子组件也会自动的更新
  基于上面的两点，我们通常的解决方案是：使用immutable进行比较，在不相等的时候调用setState；在shouldComponentUpdate中判断前后的proos和state，如果没有变化，则返回false来阻止渲染。
  在hooks出来之后，我们能够使用function的形式来创建包含内部state的组件。但是，使用function的形式，失去了上面的shouldComponentUpdate，而且在函数组件中不区分mount和update两个状态，这意味着函数组件的每一次调用都会执行其内部的所有逻辑，那么会带来较大的性能损耗。因此用useMemo和useCallback来解决性能问题。
  
#### 使用方式
```javascript
  // changeName 是 useState 实例的方法
  useMemo(changeName(name),[name])
```