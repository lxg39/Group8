const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// 路由：获取股票历史价格趋势
router.get('/historical/:symbol', stockController.getHistoricalData);

// 路由：获取股票实时价格信息
router.get('/real-time/:symbol', stockController.getCurrentData);

// 路由：获取多组股票历史价格趋势
router.get('/historical', stockController.getMultipleHistoricalData);

// 路由：获取多组股票当日价格
router.get('/real-time', stockController.getMultipleCurrentData);

module.exports = router;
