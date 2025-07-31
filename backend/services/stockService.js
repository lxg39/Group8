const apiClient = require('../utils/apiClient');

const getHistoricalData = async (symbol, period = '1m') => {
  const url = `/api/v2/markets/stock/history`;
  try {
    const data = await apiClient.get(url, { 
      symbol: symbol,
      interval: '1d',
      limit: '30'
    });
    return data.body; 
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

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

const getMultipleHistoricalData = async (symbols) => {
  const promises = symbols.map(symbol => getHistoricalData(symbol));
  return await Promise.all(promises);
};

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
