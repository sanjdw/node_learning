Vue从设计上就是一个渐进式的JavaScript框架，它的核心是解决视图渲染的问题，至于其它的能力则需要通过插件的方式来解决。在分析`Vue-Router`的实现之前，我们需要先了解Vue的通用插件的注册原理。

### 1. Vue.use
Vue提供了全局方法`Vue.use`来注册插件：
```js
/*
* vue/src/core/global-api/use.js
* initUse方法在initGlobalAPI(Vue)中被调用
*/

function initUse (Vue) {
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
}
```

`Vue.use`接收一个`plugin`参数，并通过`_installedPlugins`数组维护所有注册过的`plugin`。

可以看出，`Vue`提供的插件注册机制很简单——每个插件提供各自的静态`install`方法（或者插件本身暴露为一个方法），当通过`Vue.use(plugin)`注册插件时，插件内的`install`方法得以执行，且通过`install`方法的第一个参数可以访问到`Vue`对象。

### 2. Vue.mixin
与`Vue.use`一样，`Vue.mixin`也是Vue提供的全局静态方法，用来全局注册混入：
```js
/*
* vue/src/core/global-api/mixin.js
* initMixin方法在initGlobalAPI(Vue)中被调用
*/
function initMixin (Vue) {
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
```

`Vue.mixin`接收需要混入的参数`mixin`并通过`mergeOptions`将`mixin`合并到静态属性`Vue.options`中，**由于每个组件的构造函数都会在extend阶段合并Vue.options到自身的options中**，所以也就相当于在每一个Vue组件中都都定义了`mixin`参数中定义的选项。

注册插件时一般结合`Vue.use`和`Vue.mixin`使用，`Vue-router`的注册就使用到了它们。

### 3. Vue-Router的install
Vue-router内部提供了`install`方法：
```js
// vue-router/src/install.js
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
- 将对`_routerRoot._router`、`_routerRoot._route`的访问代理到`$router`和`$route`上，这样我们可以在组件内通过`$router`、`$route`直接访问它们。
- 通过`Vue.component`注册了全局组件`router-view`和`router-link`

### Vue-Router对象

### Matcher

### 路径切换

### 总结
