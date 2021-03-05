运用你所掌握的数据结构，设计和实现一个`LRU`(最近最少使用) 缓存机制。它应该支持以下操作：读取数据`get`和写入数据`put`。
- 读取数据`value = get(key)`：如果关键字`key`已经存在，则返回其对应的数据`value`；如果关键字不存在，则返回`-1`。为了简单起⻅，假设数据`value`都是非负整数。
- 写入数据`put(key, value`：如果关键字`key`已经存在，则更新其对应的数据`value`；如果关键字不存在，则插入数据。当缓存容量达到上限时，应该在插入新数据之前删除最久未使用的数据，从而为新的数据留出空间。

```js
class LRUCache {
  constructor (capacity) {
    this.capacity = capacity
  }

  get(key) {

  }

  put(key, value) {

  }
}
```