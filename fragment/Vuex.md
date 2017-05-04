## Vuex是什么

Vuex是一个专门为vue应用程序开发的**状态管理模式**，它采用**集中式存储管理应用的所有组件的状态**，并以相应的规则保证状态以一种可预测的方式发生变化。

当我们的应用遇到**多个组件共享状态**时，单向数据流的简洁性很容易被破坏：
- 多个视图依赖于同一个状态
- 来自不同视图的行为需要变更同一状态

对于问题一，传参的方法对于多层嵌套的组件将会非常繁琐，并且对于兄弟组件间的状态传递无能为力。

对于问题二，经常采用父子组件直接引用或者通过事件来变更和同步状态的多份拷贝。

以上这些模式非常脆弱，通常会导致无法维护的代码。因此，Vuex将组建的共享状态抽取出来，以一个全局单例模式管理。
在这种模式下，组件书构成了一个巨大的“视图”，不管在树的哪个位置，**任何组件都能获取状态或者触发行为**。

## 入门

每一个Vuex应用的核心就是store（仓库），vuex和单纯的全局对象有两个不同点：
- Vuex的状态存储是响应式的，当Vue组件从store中读取状态的时候，若store中的状态发生变化，那么相应的组件也会相应的得到高效更新。
- 无法直接改变store中的状态，改变store中的状态的唯一途径就是显示的**提交（commit）mutation**。

一个简单的store：

    //Vue.use(Vuex)
    const store = new Vuex.Store({
        state:{
            count:0
        },
        mutations:{
            increment(state){
                state.count++
            }
        }
    })
可以通过**store.state**来获取状态对象，以及通过**store.commit**方法触发状态更新：

    store.commit('increment')
    console.log(store.state.count)
注意，通过**提交mutation的方式**而非直接改变**store.state.count**，是因为我们想要更明确地追踪到状态的变化。这个简单的约定能够让你的意图更加明显，这样你在阅读代码的时候能够更容易地解读应用内部的状态改变。

**由于store中的状态是响应式的，在组建中调用store中的状态简单到仅需要在计算属性中返回即可。触发变化也仅仅是在组件的methods中提交mutations。**

## State

Vuex使用**单一状态树**——一个对象包含全部的应用层级状态。因此，他便作为一个**唯一数据源**而存在，每个应用将仅仅包含一个store实例。

#### 在Vue组件中获得Vuex状态
由于Vuex的状态存储是响应式的，从store实例中读取状态的最简单的方法就是在计算属性中返回某个状态：

	//创建一个Counter组件
	const Counter = {
		template:'<div>{{count}}</div>',
		computed:{
			count(){
				return store.state.count
			}
		}		
	}
这种模式导致组件依赖的全局状态单例。

Vuex通过`store`选项，提供了一种机制将状态从根组件`注入`到每一个子组件中：

	const app = new Vue({
		el:'#app',
		store,
		components：{Counter},
		template:`
			<div class="app">
				<counter></counter>
			</div>
		`
	})
通过在根实例中注册`store`选项，该store实例会注入到根组件下的所有子组件中，且子组件能通过`this.$store`访问到。
