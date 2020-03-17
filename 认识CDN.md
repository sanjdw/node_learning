#### 什么是CDN
> CDN是指内容分发网络（Content delivery network），通过在网络各处部署节点服务器，实现将源站内容分发至所有CDN节点，使用户可以就近访问资源。

CDN本身拥有很多位于不同地区、接入不同运营商的服务器，CDN的工作流程与DNS解析有非常大的联系。DNS解析服务器会根据网络负载状况、用户地理位置、接入网类型(电信还是网通)等条件将用户的访问请求定位到离用户路由最短、位置最近、负载最轻的CDN节点。

![CDN工作流程](https://pic.downk.cc/item/5e70f92ee83c3a1e3a5b8517.jpg)

1. 上海侧客户端请求`www.demo.com`资源，先向本地DNS发起域名解析请求。
2. 域名解析请求被发往网站授权DNS服务器。
3. 网站DNS服务器解析发现域名CNAME到了`www.democdn.com`。
4. 请求被指向CDN服务。
5. CDN对域名进行智能解析，将响应速度最快的CDN节点地址IP=B返回给本地DNS。
6. 用户获取IP=B的CDN节点地址。
7. 客户端以IP=B向上海CDN节点发出HTTP请求。
8. CDN节点检查是否有缓存，有则直接将资源返回给用户。无缓存则还需要回源。
9. CDN节点回源站拉取用户所需资源。
10. CDN节点将回源拉取的资源缓存至节点。
___
#### 参考
1. [面向前端的CDN原理介绍](https://github.com/renaesop/blog/issues/1)
2. [cname记录是什么？他存在的意义是什么？](https://www.zhihu.com/question/22916306)