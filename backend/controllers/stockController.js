const stockService = require('../services/stockService');

const getHistoricalData = async (req, res) => {
  const { symbol } = req.params;
  try {
    const data = await stockService.getHistoricalData(symbol);
    if (data) {
      res.json(data);
    } else {
      res.status(500).send('Error fetching data');
    }
  } catch (err) {
    res.status(500).send('Error fetching historical data');
  }
};

const getCurrentData = async (req, res) => {
  const { symbol } = req.params;
  try {
    const data = await stockService.getCurrentData(symbol);
    if (data) {
      res.json(data);
    } else {
      res.status(500).send('Error fetching data');
    }
  } catch (err) {
    res.status(500).send('Error fetching current data');
  }
};

const getMultipleHistoricalData = async (req, res) => {
  const symbols = req.query.symbols.split(',');
  try {
    const data = await stockService.getMultipleHistoricalData(symbols);
    res.json(data);
  } catch (err) {
    res.status(500).send('Error fetching multiple historical data');
  }
};

const getMultipleCurrentData = async (req, res) => {
  const symbols = req.query.symbols.split(',');
  try {
    const data = await stockService.getMultipleCurrentData(symbols);
    res.json(data);
  } catch (err) {
    res.status(500).send('Error fetching multiple current data');
  }
};

module.exports = {
  getHistoricalData,
  getCurrentData,
  getMultipleHistoricalData,
  getMultipleCurrentData,
};
