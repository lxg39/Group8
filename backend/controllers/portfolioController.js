const portfolioService = require('../services/portfolioService');

// Initialize the portfolio (can be called once on server start or first access)
const initializePortfolio = async (req, res) => {
    try {
        const initialCash = req.body.initialCash || 10000.00; // Allow setting initial cash
        const portfolio = await portfolioService.initializePortfolio(initialCash);
        res.status(200).json({ message: 'Portfolio initialized successfully', portfolioId: portfolio.id });
    } catch (err) {
        console.error('Error initializing portfolio:', err);
        res.status(500).send('Error initializing portfolio.');
    }
};

const getPortfolio = async (req, res) => {
    try {
        const portfolio = await portfolioService.getPortfolioOverview();
        if (portfolio) {
            res.json(portfolio);
        } else {
            res.status(404).send('Portfolio not found. Please initialize it.');
        }
    } catch (err) {
        console.error('Error fetching portfolio:', err);
        res.status(500).send('Error fetching portfolio data.');
    }
};

const buyStock = async (req, res) => {
    const { symbol, quantity, price } = req.body;
    try {
        const result = await portfolioService.buyStock(symbol, quantity, price);
        res.status(200).json({ message: 'Stock purchased successfully', ...result });
    } catch (err) {
        res.status(400).send(err.message);
    }
};

const sellStock = async (req, res) => {
    const { symbol, quantity, price } = req.body;
    try {
        const result = await portfolioService.sellStock(symbol, quantity, price);
        res.status(200).json({ message: 'Stock sold successfully', ...result });
    } catch (err) {
        res.status(400).send(err.message);
    }
};

const getTransactions = async (req, res) => {
    try {
        const transactions = await portfolioService.getTransactionsHistory();
        res.json(transactions);
    } catch (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).send('Error fetching transactions.');
    }
};

const getPortfolioTrend = async (req, res) => {
    try {
        const trend = await portfolioService.getPortfolioTrendData();
        res.json(trend);
    } catch (err) {
        console.error('Error fetching portfolio trend:', err);
        res.status(500).send('Error fetching portfolio trend data.');
    }
};


module.exports = {
    initializePortfolio,
    getPortfolio,
    buyStock,
    sellStock,
    getTransactions,
    getPortfolioTrend,
};