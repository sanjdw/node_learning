Vuex是一个为Vue.js应用程序开发的状态管理模式。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

Vuex的核心就是`store`（仓库）。“store”就是一个容器，它包含着Vue.js应用中大部分的状态，与普通的封装的全局对象不同：
- Vuex的状态是响应式的。
- 在Vuex中，改变`store`中的状态的唯一途径是显式地提交 (commit)`mutation`。

![Vuex](https://pic.downk.cc/item/5fd9f12f3ffa7d37b3601124.png)

与普通的Vue插件一样，Vuex也实现了静态方法`install`：
```js
// vuex/src/store.js
function install (_Vue) {
  if (Vue && _Vue === Vue) {
    console.error(
      '[vuex] already installed. Vue.use(Vuex) should be called only once.'
    );
    return
  }
  Vue = _Vue;
  applyMixin(Vue);
}
```

在做了Vuex安装的校验之后，将传入的`Vue`传给`applyMixin`：
```js
// vuex/src/mixin.js
function applyMixin (Vue) {
  var version = Number(Vue.version.split('.')[0])
  // 兼容1.0版本
  if (version >= 2) {
    Vue.mixin({ beforeCreate: vuexInit })
  } else {
    var _init = Vue.prototype._init
    Vue.prototype._init = function (options) {
      if ( options === void 0 ) options = {}

      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit
      _init.call(this, options)
    }
  }

  function vuexInit () {
    var options = this.$options
    if (options.store) {
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store
    }
  }
}
```


