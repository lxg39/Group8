# 代码使用说明

## 1. yahoo api 注册

链接：https://rapidapi.com/sparior/api/yahoo-finance15/playground/apiendpoint_3202b1b9-9938-4e63-9ae2-de6791d96c3b

点击sign up注册后，会得到一个`X-RapidAPI-Key`，这个后续会用到。

## 2. 代码本地运行

1. 先从git拉取代码，在本地创立自己的分支后，在之上进行开发；

2. 初始化npm，`npm init -y`；

3. 安装所需依赖，可见 `package.json` 文件；

4. 配置 /backend/.env 文件：

   ```
   # MySQL数据库配置，按自己的需要配置
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=stock_portfolio
   
   # Yahoo Finance API,这里使用步骤1注册后自己的KEY
   RAPIDAPI_KEY=8588a13af5mshbf3dc5b676edadcp166ec6jsnbd76d6852e81
   ```

5. 在`/backend`文件夹下运行 node server.js，启动后端

## 3. API说明

### 3.1 和stock相关的接口

接口功能：负责从yahoo api获取数据

```js
// 获取某只股票30天的历史数据
http://localhost:3000/api/historical/:symbol
使用示例：http://localhost:3000/api/historical/AAPL

// 获取某只股票的实时数据
http://localhost:3000/api/real-time/:symbol
使用示例：http://localhost:3000/api/real-time/AAPL

// 批量获取多只股票的历史数据
http://localhost:3000/api/historical
使用示例：http://localhost:3000/api/historical?symbols=AAPL,GOOG

// 批量获取多只股票的实时数据
http://localhost:3000/api/real-time
使用示例：http://localhost:3000/api/real-time?symbols=AAPL,GOOG
```

