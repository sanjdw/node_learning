# git在几种常用情况下的命令

- **在本地新建一个仓库，推到github上**

    1.在项目路径下，

        git init
    2.然后到自己的github上去，右上角**new repository**新建一个仓库，仓库名最好与本地项目名一致。

    3.将本地仓库与github上的仓库关联起来：

        git remote add origin git@github.com:sanjdw/project.git
        //这里的sanjdw是我的github用户名，你在这里需要填上你自己的github账户名
        //project是我当前项目(仓库)的名字，这里请填上你自己的项目(仓库)名
    4.项目搭建完以后，push到自己的github上去。
        git add/commit就不讲了

        git push -u origin master
        //注意这里的参数  -u: git就会把本地的master分支和github上的master分支关联起来，以后再push的时候就不需要这个参数了

- **在公司的电脑上把项目push到github上，回到家clone下来**

     1.