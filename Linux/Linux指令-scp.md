`scp`命令用于`Linux`之间复制文件和目录。

>`scp`是`secure copy`的缩写, `scp`是 linux系统下基于`ssh`登陆进行安全的远程文件拷贝命令。

写法：
```bash
scp [可选参数] file_source file_target 
```

参数说明：
- `-4`： 使用`IPv4`寻址
- `-6`： 使用`IPv6`寻址
- `-r`： 复制整个目录
- `-p`：保留原文件的修改时间、访问时间和访问权限
- `-P port`： 指定端口
- `-F ssh_config`：指定ssh配置文件

#### 1.从服务器上下载文件
```bash
scp grain0217@118.25.53.214:/home/grain/work/public/index.html /path/

# 下载整个文件夹
scp -r grain0217@118.25.53.214:/home/grain/work/public /path/
```


#### 2.上传本地文件到服务器
```bash
scp /path/filename grain0217@118.25.53.214:/home/grain/work/public/

# 上传整个文件夹
scp -r /path grain0217@118.25.53.214:/home/grain/work/public/
```
