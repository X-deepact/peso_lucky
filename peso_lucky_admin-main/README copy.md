# COLOR GAME 前端环境搭建

1. jenkins

```bash
curl https://get.volta.sh | bash
volta install node@v16.20.2 # 一定要按照这个顺序
npm i yarn@1 -g # 一定要按照这个顺序
volta install node@20.10.0 # 一定要按照这个顺序
npm i yarn@1 -g # 一定要按照这个顺序
```

# window volta 下载链接

```downlink
https://objects.githubusercontent.com/github-production-release-asset-2e65be/104796770/c358f49e-b9cb-4c08-ad0d-93da066c04e9?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=releaseassetproduction%2F20241017%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241017T082514Z&X-Amz-Expires=300&X-Amz-Signature=b4901604363d29a6865af6cdc6e986b4f28475eea0b069931e691f16f79ca7ea&X-Amz-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%3Dvolta-1.1.1-windows-x86_64.msi&response-content-type=application%2Foctet-stream
```

1. 打包

> 特殊的项目 [https://gitlab.casinovip.tech/minigame_front/mini_games_admin](https://gitlab.casinovip.tech/minigame_front/mini_games_admin) 需要 部署两次分别带上 两个环境变量 `PLATFORM=CNONTROL` 总控 `PLATFORM=MERCHANT` 商户

```bash
yarn install
yarn run build:环境 # yarn build:dev yarn build:test
# 输出目录 {root}/dist
```

3.  部署的 nginx

```bash
# 404 callback index.html
try_files $uri $uri/ /index.html
# 缓存所有 assets 目录下文件 （通过vite 打包assets 文件名为hash 文件名）eg. /assets/1x-03c60a73.png
location /assets/ {
    expires 30d; # 设置缓存过期时间为 30 天
    add_header Cache-Control "public"; # 设置 Cache-Control 头部为 public、
}
```
