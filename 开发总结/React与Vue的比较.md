年底组里新的项目开始转向使用React技术栈，业务的开发过程中也在不断思考比较，使得我想尝试回答这个面试中常见的问题——React和Vue各有哪些特点？

React和Vue有很多相似之处，它们都有：
- 使用Virtual DOM
- 提供了响应式和组件化的视图组件
- 将注意力集中保持在核心库，将路由、状态管理交给相关库

### 组件
React的思路是`HTML in JavaScript`，提倡使用jSX定义组件。

Vue提倡模板+JavaScript+CSS的组合模式呈现组件（当然Vue中也可以借助Babel Preset JSX使用JSX），视图、行为与表现相分离，这一点与传统web开发者熟悉的模板契合度更高。

逻辑复用

React在15.5版本之后废弃了`createClass`，

### 渲染
在React中，一个组件的状态发生变化时，会导致该组件及其子组件的重新渲染，需要开发者自己去处理避免不必要的渲染：
- Class Component中通过`PureComponent`或者`shouldComponentUpdate`去实现
- Function Component中需要合理使用`React Hooks`

而在Vue中，组件视图对状态的依赖是在渲染过程中自动追踪的，所以Vue能够精确知道哪一个组件需要被重新渲染，这一特点使得Vue的使用者不需要考虑渲染优化问题，专注于业务的开发。

### 生态
Vue的路由、状态管理等库都是由官方维护的，React则将它们交给社区去做，因此相对于Vue，React的生态系统更加繁荣。

### 总结
Vue内置了指令、filter、computed、状态依赖收集等很多特性，而在React中这些都交给了开发者自己去实现。因此相较于React，实际的开发流程中React更加灵活。

另一方面，在实际的项目开发场景中，使用React的话，同样的业务功能不同的开发人员有不同的实现。从这个角度来讲，基于Vue开发的代码可维护性更高（我是这样觉得的，在帮别人改bug时代码中的业务逻辑更容易抓住）。

看到有这样一个比方——**React是手动挡，Vue是自动挡**，我想大概可以巧妙地总结React和Vue的不同之处。

### 参考
1. [对比其他框架-Vuejs.org](https://cn.vuejs.org/v2/guide/comparison.html)
2. [Vue和React的使用场景和深度有何不同？](https://www.zhihu.com/question/31585377)
