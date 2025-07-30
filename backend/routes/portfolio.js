const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

// Initialize the single user's portfolio (call once)
router.post('/portfolio/initialize', portfolioController.initializePortfolio);

// Portfolio Management
router.get('/portfolio', portfolioController.getPortfolio);
router.post('/portfolio/buy', portfolioController.buyStock);
router.post('/portfolio/sell', portfolioController.sellStock);
router.get('/portfolio/transactions', portfolioController.getTransactions);
router.get('/portfolio/trend', portfolioController.getPortfolioTrend);

module.exports = router;