由于HTTP明文传输的特性，在 HTTP 的传输过程中，任何人都有可能从中**截获、修改或者伪造请求**，所以可以认为HTTP是不安全的；在HTTP的传输过程中**不会验证通信方的身份**，因此HTTP信息交换的双方可能会遭到伪装，也就是没有**用户验证**；在HTTP的传输过程中，接收方和发送方并不会验证报文的完整性，综上，为了结局上述问题，HTTPS应用而生。

相对于HTTP所有数据都是以明文传输的，HTTPS可以将客户端和服务端通信的数据都进行加密，实际上HTTPS是将HTTP跑在用于加密传输的SSL/TLS协议之上的。

HTTPS
___
#### 参考
1. [HTTPS原理](https://lausai360.blogspot.com/2017/06/https.html)
2. [http和https的区别](https://juejin.im/post/5c1c9b50f265da616e4c695e)
3. [HTTPS是如何工作的？3分钟介绍HTTPS
](https://www.bilibili.com/video/av86882946/?spm_id_from=333.788.videocard.2)
4. [](https://juejin.im/post/5c6e5803f265da2dc0065437)