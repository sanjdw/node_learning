## 几个用的比较少的CSS选择器

1. 邻近元素选择器

```
ul + p {
    color: red;
}
```

**只选中紧接在ul元素后的第一个兄弟p元素**。

2. 直接后代选择器

```
#container > ul {
  border: 1px solid black;
}
```
与
```
#container ul {
  border: 1px solid black;
}
```
区别是前者只会选中直接后代，如
```
<div id="container">
  <ul>
    <li> List Item
      <ul>
      <li> Child </li>
      </ul>
    </li>
    <li> List Item </li>
    <li> List Item </li>
    <li> List Item </li>
  </ul>
</div>
```
`#container > ul`只会定义id为`container`的div里的第一代子元素ul，而不会定义第一个li里的第二代子元素ul。

3. 兄弟选择器
```
ul ~ p {
  color: red;
}
```
兄弟选择器和邻近选择器(`ul + p`)很像，但没有那么严格。`ul + p`只会选择紧接在ul元素后的第一个兄弟元素p，但兄弟选择器更广泛，在上面的例子中，只要在ul后的p兄弟元素都会被选中。

4. 通过正则匹配前后缀等。
- 
  ``` 
  a[href*="nettuts"]
  ```
- 
  ```
  a[href^="http"]
  ```
- 
  ```
  a[href$="http"]
  ```



5. 否定伪类
```
div:not(#container) {
  color: blue;
}
```
否定伪类非常有用。比如，希望选中所有的div元素，除了一个id为`container`的div。

6. 伪元素