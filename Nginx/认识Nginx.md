### Nginx是什么
Nginx是一款开源的HTTP服务器（又称Web服务器）和反向代理服务器，同时也是一个IMAP、POP3、SMTP代理服务器。

### HTTP服务器
Nginx作为一个轻量级的HTTP服务器，能够很好地应对高并发的HTTP请求。

![客户端、HTTP服务器与应用服务器](https://pic.downk.cc/item/5e6cb1b7e83c3a1e3a2dbafd.jpg)

如上图所示，在客户端与服务端通信的架构中，Nginx作为HTTP服务器，可以将服务器文件系统的静态文件（HTML、图片等）通过HTTP协议响应给客户端；而对于动态资源请求，Nginx将请求交给**应用服务器**处理。

### 反向代理服务器
互联网应用大多基于CS架构，即client端和server
端，代理就是在client端和server端之间的服务器，称为代理服务器。

> 正向代理隐藏真实的客户端，反向代理隐藏真实的服务端。

![正向代理](https://pic.downk.cc/item/5e6cb9d9e83c3a1e3a3586d0.jpg)

在上图中，客户端的请求经过代理向外发出，响应也由代理接收返回，这就是正向代理，平时翻墙的梯子可以理解为正向代理服务器。

而反向代理则代理的是服务器而不是客户：

![反向代理](https://pic.downk.cc/item/5e6cba9be83c3a1e3a3642ea.jpg)

客户端发往服务端的请求，首先进入代理服务器，代理服务器将请求代理到真正处理请求的服务器上，Nginx就是扮演这个反向服务器的角色的。

反向代理有两个好处：
- 安全：使用反向代理后，客户端无法通过请求直接访问真正提供服务的服务器，请求首先经过Nginx，而Nginx可以将危险或没有权限的请求过滤掉。

- 负载均衡：通过各种调度算法机制将来自客户端的请求分发给真实的服务器，以减轻对单个服务器的负载压力。

### 前端眼里的Nginx
### 1. 解决跨域

___
### 2. 图片处理
前端项目的开发中，经常会有对图片尺寸、品质处理的需要，依赖[ngx_http_image_filter_module](http://nginx.org/en/docs/http/ngx_http_image_filter_module.html)模块，Nginx可以搭建图片处理服务，下面是一个Nginx配置图片尺寸裁剪的demo：

```nginx
server {
  listen 80;
  server_name myvideodistribute
  # 图片缩放处理
  location ~ "^/myvideodistribute/(?<image>.+)@(?<width>\d+w)_(?<height>\d+h)$" {
    ## alias /some/path/ 图片资源具体路径
    image_filter crop $width $height; #设置图片宽高
    image_filter_buffer 10M;   #设置Nginx读取图片的最大buffer。
    image_filter_interlace on; #是否开启图片图像隔行扫描
  }
}
```
338w_450h:

![338w_450h](https://pic.downk.cc/item/5e6cf5bae83c3a1e3a5b6b3d.jpg)

338w_500h:

![338w_500h](https://pic.downk.cc/item/5e6cf613e83c3a1e3a5ba2d2.jpg)

___
### 3. 静态资源缓存
```nginx
{
  # add_header Cache-Control no-store; 禁用缓存
  expires 30d; # 缓存30天
}

```

___
### 4. 适配PC端与移动端
为更好提升移动端的用户体验，在PC端站点之外，互联网公司一般都会单独开发一个给移动端用户访问的站点。当用户用移动终端访问PC站点，自动跳转到m站点。

```nginx
location / {
  # 移动、pc设备适配
  if ($http_user_agent ~* '(Android|webOS|iPhone|iPod|BlackBerry)') {
    set $mobile_request '1';
  }
  if ($mobile_request = '1') {
    rewrite ^.+ https://m.maoyan.com/;
  }
}
```
在移动设备上访问[猫眼电影的PC端站点(https://maoyan.com/)](https://maoyan.com/)会跳转到[http://maoyan.com/](http://maoyan.com/)。

___
### 5. Gzip压缩
Gzip是文件压缩程序的简称。Nginx可以利用gzip压缩，来减小返回给客户端的静态资源的HTTP响应的体积，提高传输速率。

```nginx
# 开启gzip压缩
gzip on;
gzip types text/css text/xml application/javascript;      # 指定开启压缩的资源类型
gzip_min_length 1k;   # 对大于1K文件资源开启压缩
gzip_buffers 4 16k;   # 设置压缩缓冲区大小，此处设置为4个16K内存作为压缩结果流缓存
gzip_comp_level 6;    # 设置gzip压缩等级，最小为1，处理速度快，传输速度慢；9为最大压缩比，处理速度慢，传输速度快; 级别越高，压缩就越小，节省了带宽资源，但同时也消耗CPU资源，一般折中为6
```

浏览器在发送请求时会在请求头部中带上
```http
Accept-Encoding: gzip
```
表示支持Gzip。
而Ngin在将Gzip压缩处理的资源响应给客户端时在HTTP响应头部中指出：
```http
Content-Encoding: gzip
```
告诉浏览器对获得的资源做解压缩处理。

两类文件资源不建议启用Gzip压缩：

1. **图片类型资源 (还有视频文件)**

    图片如jpg、png文件本身就会有压缩，所以gzip压缩前和压缩后体积不会有太大区别，所以开启Gzip反而会浪费资源。

2. **大文件资源**
  
    会消耗大量cpu资源，且不一定有明显的效果。

___
### 6. 合并请求
借助淘宝开发的第三方模块[nginx-http-concat](https://github.com/alibaba/nginx-http-concat)。

___
### 参考
1. [Nginx与前端开发](https://juejin.im/post/5bacbd395188255c8d0fd4b2)
2. [Nginx常见正则匹配符号表示](https://www.cnblogs.com/netsa/p/6383094.html)
3. [入门系列之在Nginx配置Gzip](https://juejin.im/post/5b518d1a6fb9a04fe548e8fc)