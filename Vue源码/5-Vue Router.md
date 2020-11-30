Vue从设计上就是一个渐进式的JavaScript框架，它的核心是解决视图渲染的问题，至于其它的能力则需要通过插件的方式来解决。在分析`Vue-Router`的注册实现之前，需要先了解Vue的通用插件注册原理。

### 1. Vue.use
Vue提供了全局方法`Vue.use`来注册插件：
```js
Vue.use = function (plugin) {
  const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
  if (installedPlugins.indexOf(plugin) > -1) {
    return this
  }

  const args = toArray(arguments, 1)
  args.unshift(this)
  if (typeof plugin.install === 'function') {
    plugin.install.apply(plugin, args)
  } else if (typeof plugin === 'function') {
    plugin.apply(null, args)
  }

  installedPlugins.push(plugin)
  return this
}
```

它接受一个`plugin`参数，并通过`_installedPlugins`数组维护所有注册过的`plugin`。可以看出，`Vue`提供的插件注册机制很简单——每个插件都要实现一个静态的`install`方法（或者插件本身暴露为一个方法）。当通过`Vue.use`注册插件时，插件内的`install`方法得以执行，且通过`install`方法的第一个参数可以访问到`Vue`对象。

### 2. Vue-Router的install
```js
function install (Vue) {
  // 通过installed标记为确保安装逻辑只执行一次，并通过_Vue维护对Vue的引用
  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  Vue.mixin({
    beforeCreate () {
      if (isDef(this.$options.router)) {
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this)
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })

  // 将$router和$route的访问代理到_routerRoot._router、_routerRoot._route
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  // 注册全局组件router-view和router-link
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  const strats = Vue.config.optionMergeStrategies
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
```

`Vue-Router`的安装方法中主要做了以下几件事情：
- 维护对Vue的引用，通过静态属性`installed`确保安装逻辑仅执行一次
- 通过`Vue.mixin`将`beforeCreate`和`destroyed`钩子函数注入到每一个组件中去
- 将Vuey原型对象的`$router`和`$route`的访问代理到`_routerRoot._router`、`_routerRoot._route`，这样我们可以在组件内直接访问它们。另外注册了全局组件`router-view`和`router-link`

需要重点分析的是通过`Vue.mixin`注册钩子函数，首先来看`mixin`：
```js
Vue.mixin = function (mixin) {
  this.options = mergeOptions(this.options, mixin)
  return this
}
```

`mixin`的实现很简单，将需要混入的参数通过`mergeOptions`合并到`Vue`的静态属性`options`中，由于每个组件的构造函数都会在 extend 阶段合并 Vue.options 到自身的 options 中，所以也就相当于每个组件都定义了 mixin 定义的选项。

### Vue-Router对象

### Matcher

### 路径切换

### 总结