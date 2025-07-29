const express = require('express');
// const cors = require('cors');
const stockRoutes = require('./routes/stock');

const app = express();
const port = 3000;

// 中间件
// app.use(cors());

// 路由
app.use('/api', stockRoutes);

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
