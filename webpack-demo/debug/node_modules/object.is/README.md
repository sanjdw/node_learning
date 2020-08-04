# object.is

> [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) [ponyfill](https://ponyfill.com)

## use the built-in

If you don't need to support Internet Explorer, you probably do not need this package. `Object.is()` is supported in most environments. Just use `Object.is()` directly.

## install

```sh
$ npm install object.is
```

## example

```js
const is = require('object.is')

is('foo', 'foo') // => true
is(NaN, 0 / 0 ) // => true
```
