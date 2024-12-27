### 需要环境 

node 20.12.0
yarn 4.5.3

#### h5 部署

```sh
yarn install # 4.5.3
yarn h5:build:dev #  yarn h5:build:[环境] 
# 输出内容目录在 /apps/h5/dist 
```


#### 生成内容结构
/index.html
/xxxx.html
/xxxx/index.html

```nginx
location / {
    try_files $uri $uri.html $uri/ =404;
}
```