## Vue-Router

### 简介
对于单页应用，官方提供了`vue-touter`进行路由跳转的处理。
####html：

	<div id="app">
	  <h1>Hello App!</h1>
	  <p>
	    <!-- 使用 router-link 组件来导航. -->
	    <!-- 通过传入 `to` 属性指定链接. -->
	    <!-- <router-link> 默认会被渲染成一个 `<a>` 标签 -->
	    <router-link to="/foo">Go to Foo</router-link>
	    <router-link to="/bar">Go to Bar</router-link>
	  </p>
	  <!-- 路由出口 -->
	  <!-- 路由匹配到的组件将被渲染到这里 -->
	  <router-view></router-view>
	</div>
#### JavaScript：
	
	//import Vue from 'vue'
	//import VueRouter from 'vue-router'
	//Vue.use(VueRouter)
	//定义（路由）组件
	import Foo from './component/foo'
	import Bar from './component/bar'
	//定义路由，每个路由应该映射一个（路由）组件
	const routes = [
		{path:'/foo',component:Foo},
		{path:'/bar',component:Bar}
	]
	//创建router实例，然后传routes配置
	const router = new VueRouter({
		routes//相当于 routes:routes
	})
	//创建和挂载根实例，记得注入router
	const app = new Vue({
		router
	}).$mount('#app')
	
### 注入的属性
通过在Vue根实例的`router`配置中传入`router`实例，下面属性成员会被注入到每个子组件：

 - $router 
	router实例
 - $route
	当前激活的**路由信息对象**，这个属性是只读的，里面的属性是不可变的，但是可以监听它。

### Router实例
- 属性
	- router.app
		- Vue实例类型
		- 配置了router的Vue根实例
	- router.mode
		- string类型
		- 路由使用的模式
	- route.currentRoute
		- route类型
		- 当前路由对应的路由信息对象
- 方法
	- router.beforeEach(guard)
	- router.afterEach(hook)
	- router.push(location)
	- router.replace(location)
	- router.go(n)
	- router.back()
	- router.forward()
	- router.getMatchedComponents(locations?)
	- 
### 路由信息对象
一个路由信息对象表示当前激活的路由的状态信息，包含了当前url解析得到的信息，还有url匹配到的路由纪录。
路由信息对象是不可变的，每次成功的导航后都会产生一个新的对象。

路由信息对象的属性：
- $route.path
	- string类型
	- 对应当前路由的路径，总是解析为绝对路径
- $route.params
	- object类型
	- 一个key/value对象，包含了动态片段和全匹配片段，若没有路由参数，它就是一个空对象。	  
- $route.query
	- object类型
	- 一个key/value对象，表示url查询参数，例如L对于路径`/foo?user=yugu`,则有`$route.query.user === 'yugu'`,若没有查询参数，则是一个空对象。
-  $route.hash
	- string类型
	- 当前路由的hash值（带#）,若没有hash值，则是一个空字符串。
-  $route.fullPath
	- string类型
	- 完成解析后的url，包含查询参数和hash的完整路径。
-  $route.name
	- 当前路由的名称，如果有的话。
	- 
### 动态路由匹配
经常需要把某种模式匹配到的所有路由全部映射到同一个组件，比如对于所有id不同的用户都用同一个User组件:

	import User
	const router = new VueRouter({
		routes:[
			{path:'uer/:id',component:User}
		]
	})
一个`路径参数`使用冒号`:`标记，当匹配到一个路由时，参数值会被设置到`this.$route.params`：
|模式|匹配路径|$route.params|
|---|:-----:|:-----------:|
|user/:username|/user/yugu|{username:'yugu'}|
|user/:username/post/:id|/user/yugu/post/1993|{username:'yugu',id:1993}|

### 命名路由
有时候通过一个名称来标识一个路由显得更方便一些：

	const router = new VueRouter({
		routes:[
			{path:'user/:userid'},
			name:'user',
			component:User
		]
	})
在链接到这个命名路由的时候，可以给`router-link`的`to`属性传一个对象：

	<router-link :to="{name:'user',params:{suerid:1993}}">User</router-link>
这与使用`router.push()`是同一回事：

	router.push({name:'user',params:{userid:1993})
	
### 编程式导航
除了使用`<router-link>`创建a标签定义导航链接，还可以借助router的实例方法：router.push(location)，该方法的参数是一个字符串路径或者一个描述地址的对象：

	//字符串
	router.push('home')
	//对象
	router.push({path:'home'})
	//命名的路由
	router.push({name:'user',params:{userid:1993}})
	//带查询参数，变成 /register?plan=private
	router.push({path:'register',query:{plan:'private'}})
#### router.replace(location)
跟router.push很像，不同的是它不会向history添加新纪录，而是替换当前的history纪录：
|声明式|编程式|
|:----:|:----:|
|&lt;router-link&gt; :to="" replace|router,replace()|
#### router.go()
这个方法的参数是一个整数，意思是在history记录中向前或者后退多少步

### 匹配优先级
同一个路径有可能匹配多个路由，匹配的优先级按照路由的定义顺序：谁先定义，谁的优先级更高。

### 路由懒加载
