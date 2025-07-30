const express = require("express");
const cors = require("cors"); // 引入 cors 中间件
const stockRoutes = require("./routes/stock");
const portfolioRoutes = require("./routes/portfolio");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors()); // 使用 cors 中间件解决跨域问题

// 静态文件服务
// 假设 index.html 文件在 frontend 目录下
app.use(express.static("../frontend"));

// 路由
app.use("/api", stockRoutes);
app.use("/api", portfolioRoutes);

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
