## fe_learning

纪录我的学习~~node~~node,vue,es6的~~过程~~一些片段
#### 系统环境
>ubuntu14.0
#### 开发环境的搭建
安装nodejs、升级至最新版本

        # apt-get update  
        # apt-get install -y python-software-properties software-properties-common  
        # add-apt-repository ppa:chris-lea/node.js  
        # apt-get update  
        # apt-get install nodejs
        # npm install -g n
        # n stable

安装mongodb、查看版本

        # apt-get install mongodb
        # mongo -version
安装git

        # apt-get install git
npm更新至最新版本
    
        # npm install -g npm

npm install由于环境变量没有配置提示node版本不够的问题

    修改/etc/profile文件，在末尾添加:

          >export NODE_HOME=/usr/local/n/versions/node/7.10.0/bin  //本地新版本Node所在路径
          >export PATH=$NODE_HOME/bin:$PATH
    
    source /etc/profile生效
