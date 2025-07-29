const apiClient = require('../utils/apiClient');

// 获取股票历史价格数据
const getHistoricalData = async (symbol) => {
  const url = `/api/v2/markets/stock/history`; // 更新后的历史数据 URL
  try {
    const data = await apiClient.get(url, { 
      symbol: symbol,
      interval: '1d',  // 间隔1天
      limit: '30'  // 限制30条数据
    });
    return data.body; 
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

// 获取股票当日价格数据
const getCurrentData = async (symbol) => {
  const url = `/api/v1/markets/quote`;
  try {
    const data = await apiClient.get(url, {
      ticker: symbol,
      type: 'STOCKS'
    });

    return data.body;
  } catch (error) {
    console.error('Error fetching real-time data:', error);
    throw error;
  }
};

// 获取多组股票历史数据
const getMultipleHistoricalData = async (symbols) => {
  const promises = symbols.map(symbol => getHistoricalData(symbol));
  return await Promise.all(promises);
};

// 获取多组股票当日数据
const getMultipleCurrentData = async (symbols) => {
  const promises = symbols.map(symbol => getCurrentData(symbol));
  return await Promise.all(promises);
};

module.exports = {
  getHistoricalData,
  getCurrentData,
  getMultipleHistoricalData,
  getMultipleCurrentData,
};
