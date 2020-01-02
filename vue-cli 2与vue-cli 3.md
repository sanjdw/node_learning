#### 安装
```shell
# vue-cli 2
npm install -g vue-cli
# vue-cli 3
npm install -g @vue/cli
```
由于vue-cli 3与2使用了相同的vue命令，导致vue-cli 2被覆盖，可以通过桥接工具继续使用vue-cli 2：
```bash
npm install -g @vue/cli-init
# 可以继续使用vue init
vue init webpack project-name
```