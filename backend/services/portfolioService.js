const portfolioModel = require('../models/portfolioModel');
const stockService = require('./stockService');

// Initialize the single portfolio if it doesn't exist
const initializePortfolio = async (initialCash = 10000.00) => {
    let portfolio = await portfolioModel.getPortfolio();
    if (!portfolio) {
        const portfolioId = await portfolioModel.createInitialPortfolio(initialCash);
        portfolio = await portfolioModel.getPortfolio(); // Fetch it again to get full details
        console.log(`Initial portfolio created with ID: ${portfolioId}`);
    }
    return portfolio;
};

// const getPortfolioOverview = async () => {
//     const portfolio = await portfolioModel.getPortfolio();
//     if (!portfolio) {
//         throw new Error('Portfolio not found. Please initialize it.');
//     }

//     let holdings = await portfolioModel.getAllStockHoldings();
//     let totalStockValue = 0;
//     const holdingsWithCurrentData = [];

//     if (holdings.length > 0) {
//         const symbols = holdings.map(holding => holding.stock_symbol);
//         const currentDataArray = await stockService.getMultipleCurrentData(symbols);

//         for (const holding of holdings) {
//             const currentData = currentDataArray.find(data => {
//                 // Adjust based on the actual structure of currentData from Yahoo Finance API
//                 return data && data.body && data.body.price_data && data.body.price_data.ticker === holding.stock_symbol;
//             });

//             const currentPrice = currentData?.body?.price_data?.regularMarketPrice || holding.current_price || 0;
//             const marketValue = holding.quantity * currentPrice;
//             totalStockValue += marketValue;

//             // Update current_price in DB if it has changed
//             if (holding.current_price !== currentPrice) {
//                 await portfolioModel.updateStockHolding(
//                     holding.stock_symbol,
//                     holding.quantity,
//                     holding.purchase_price,
//                     currentPrice
//                 );
//                 holding.current_price = currentPrice; // Update the object for immediate use
//             }

//             holdingsWithCurrentData.push({
//                 symbol: holding.stock_symbol,
//                 quantity: holding.quantity,
//                 purchasePrice: holding.purchase_price,
//                 currentPrice: currentPrice,
//                 marketValue: marketValue,
//                 profit_loss: (currentPrice - holding.purchase_price) * holding.quantity,
//             });
//         }
//     }

//     const newTotalValue = portfolio.cash_balance + totalStockValue;
//     console.log(`Total portfolio value calculated: ${newTotalValue}`);
//     // Update total_value in DB if it has changed significantly
//     if (Math.abs(newTotalValue - portfolio.total_value) > 0.01) {
//         await portfolioModel.updatePortfolioValue(portfolio.id, portfolio.cash_balance, newTotalValue);
//         portfolio.total_value = newTotalValue;
//     }

//     // Calculate investment allocation for pie chart
//     const investmentAllocation = holdingsWithCurrentData.map(holding => ({
//         symbol: holding.symbol,
//         value: holding.marketValue,
//         percentage: (holding.marketValue / newTotalValue) * 100,
//     }));

//     return {
//         ...portfolio,
//         holdings: holdingsWithCurrentData,
//         investmentAllocation: investmentAllocation,
//     };
// };

const getPortfolioOverview = async () => {
  const portfolio = await portfolioModel.getPortfolio();
  if (!portfolio) {
    throw new Error("Portfolio not found. Please initialize it.");
  }

  let holdings = await portfolioModel.getAllStockHoldings();
  let totalStockValue = 0;
  const holdingsWithCurrentData = [];

  if (holdings.length > 0) {
    const symbols = holdings.map((holding) => holding.stock_symbol);
    const currentDataArray = await stockService.getMultipleCurrentData(symbols);

    for (const holding of holdings) {
      const currentDataResponse = currentDataArray.find((data) => {
        // real-time data struc: { symbol: 'AAPL', primaryData: { lastSalePrice: '$211.27', ... }, ... }
        return data && data.symbol === holding.stock_symbol;
      });

      let currentPrice = 0;
      if (currentDataResponse) {
        // use primaryData first，if primaryData can't use，then try secondaryData
        const priceData = currentDataResponse.primaryData || currentDataResponse.secondaryData;

        if (priceData && priceData.lastSalePrice) {
          currentPrice = parseFloat(priceData.lastSalePrice.replace(/[^0-9.-]+/g, ""));

          if (isNaN(currentPrice)) {
            console.warn(`Could not parse price for ${holding.stock_symbol}: ${priceData.lastSalePrice}. Using stored price.`);
            currentPrice = holding.current_price || 0;
          }
        } else {
            console.warn(`No valid lastSalePrice found for ${holding.stock_symbol} in current data. Using stored price.`);
            currentPrice = holding.current_price || 0;
        }
      } else {
        console.warn(`No current data found for ${holding.stock_symbol}. Using stored price.`);
        currentPrice = holding.current_price || 0;
      }

      // make sure currentPrice is a valid number
      if (isNaN(currentPrice)) {
        currentPrice = 0;
      }

      const marketValue = holding.quantity * currentPrice;
      totalStockValue += marketValue;

      // Update current_price in DB if it has changed
      if (parseFloat(holding.current_price) !== currentPrice) {
        await portfolioModel.updateStockHolding(
          holding.stock_symbol,
          holding.quantity,
          holding.purchase_price,
          currentPrice 
        );
        holding.current_price = currentPrice; // Update the object for immediate use
      }

      holdingsWithCurrentData.push({
        symbol: holding.stock_symbol,
        quantity: holding.quantity,
        purchasePrice: holding.purchase_price,
        currentPrice: currentPrice,
        marketValue: marketValue,
        profit_loss: (currentPrice - holding.purchase_price) * holding.quantity,
      });
    }
  }

//   const newTotalValue = Number(portfolio.cash_balance) + totalStockValue;
  const newTotalValue = totalStockValue;
  // Update total_value in DB if it has changed significantly
  if (Math.abs(newTotalValue - Number(portfolio.total_value)) > 0.01) {
    await portfolioModel.updatePortfolioValue(
      portfolio.id,
      portfolio.cash_balance,
      newTotalValue
    );
    portfolio.total_value = newTotalValue;
  }

  // Calculate investment allocation for pie chart
  const investmentAllocation = holdingsWithCurrentData.map((holding) => ({
    symbol: holding.symbol,
    value: holding.marketValue,
    // 确保 newTotalValue 不为 0，避免除以零
    percentage: newTotalValue !== 0 ? (holding.marketValue / newTotalValue) * 100 : 0,
  }));

  return {
    ...portfolio,
    holdings: holdingsWithCurrentData,
    investmentAllocation: investmentAllocation,
  };
};

// const buyStock = async (symbol, quantity, price) => {
//     const portfolio = await portfolioModel.getPortfolio();
//     if (!portfolio) {
//         throw new Error('Portfolio not found. Please initialize it.');
//     }

//     const cost = quantity * price;
//     if (portfolio.cash_balance < cost) {
//         throw new Error('Insufficient cash balance.');
//     }

//     const newCashBalance = portfolio.cash_balance - cost;
//     const portfolioId = portfolio.id;

//     await portfolioModel.recordTransaction(portfolioId, symbol, 'buy', quantity, price);

//     // Update stocks table
//     let stockHolding = await portfolioModel.getStockHoldingBySymbol(symbol);
//     if (stockHolding) {
//         const totalShares = stockHolding.quantity + quantity;
//         const newPurchasePrice = ((stockHolding.quantity * stockHolding.purchase_price) + (quantity * price)) / totalShares;
//         // Current price will be updated on next portfolio overview fetch
//         await portfolioModel.updateStockHolding(symbol, totalShares, newPurchasePrice, stockHolding.current_price);
//     } else {
//         await portfolioModel.addStockHolding(symbol, quantity, price);
//     }

//     // Recalculate and update total_value in getPortfolioOverview
//     await portfolioModel.updatePortfolioValue(portfolioId, newCashBalance, portfolio.total_value); // Update cash, total_value will be recalculated on next fetch.

//     return { success: true, newCashBalance };
// };

// const sellStock = async (symbol, quantity, price) => {
//     const portfolio = await portfolioModel.getPortfolio();
//     if (!portfolio) {
//         throw new Error('Portfolio not found. Please initialize it.');
//     }

//     let stockHolding = await portfolioModel.getStockHoldingBySymbol(symbol);

//     if (!stockHolding || stockHolding.quantity < quantity) {
//         throw new Error('Insufficient shares to sell.');
//     }

//     const proceeds = quantity * price;
//     const newCashBalance = Number(portfolio.cash_balance) + Number(proceeds);
//     const portfolioId = portfolio.id;

//     await portfolioModel.recordTransaction(portfolioId, symbol, 'sell', quantity, price);

//     // Update stocks table
//     const newQuantity = stockHolding.quantity - quantity;
//     if (newQuantity === 0) {
//         await portfolioModel.deleteStockHolding(symbol);
//     } else {
//         // Purchase price remains the same for remaining shares, current_price will be updated later
//         await portfolioModel.updateStockHolding(symbol, newQuantity, stockHolding.purchase_price, stockHolding.current_price);
//     }

//     // Recalculate and update total_value in getPortfolioOverview
//     await portfolioModel.updatePortfolioValue(portfolioId, newCashBalance, portfolio.total_value); // Update cash, total_value will be recalculated on next fetch.

//     return { success: true, newCashBalance };
// };

// Modified: Added transactionDate parameter
const buyStock = async (symbol, quantity, price, transactionDate = null) => {
    const portfolio = await portfolioModel.getPortfolio();
    if (!portfolio) {
        throw new Error('Portfolio not found. Please initialize it.');
    }

    const cost = quantity * price;
    if (portfolio.cash_balance < cost) {
        throw new Error('Insufficient cash balance.');
    }

    const newCashBalance = portfolio.cash_balance - cost;
    const portfolioId = portfolio.id;

    // Pass transactionDate to recordTransaction
    await portfolioModel.recordTransaction(portfolioId, symbol, 'buy', quantity, price, transactionDate);

    let stockHolding = await portfolioModel.getStockHoldingBySymbol(symbol);
    if (stockHolding) {
        const totalShares = stockHolding.quantity + quantity;
        const newPurchasePrice = ((stockHolding.quantity * stockHolding.purchase_price) + (quantity * price)) / totalShares;
        await portfolioModel.updateStockHolding(symbol, totalShares, newPurchasePrice, stockHolding.current_price);
    } else {
        await portfolioModel.addStockHolding(symbol, quantity, price);
    }

    await portfolioModel.updatePortfolioValue(portfolioId, newCashBalance, portfolio.total_value);

    return { success: true, newCashBalance };
};

// Modified: Added transactionDate parameter
const sellStock = async (symbol, quantity, price, transactionDate = null) => {
    const portfolio = await portfolioModel.getPortfolio();
    if (!portfolio) {
        throw new Error('Portfolio not found. Please initialize it.');
    }

    let stockHolding = await portfolioModel.getStockHoldingBySymbol(symbol);

    if (!stockHolding || stockHolding.quantity < quantity) {
        throw new Error('Insufficient shares to sell.');
    }

    const proceeds = quantity * price;
    const newCashBalance = Number(portfolio.cash_balance) + Number(proceeds);
    const portfolioId = portfolio.id;

    // Pass transactionDate to recordTransaction
    await portfolioModel.recordTransaction(portfolioId, symbol, 'sell', quantity, price, transactionDate);

    const newQuantity = stockHolding.quantity - quantity;
    if (newQuantity === 0) {
        await portfolioModel.deleteStockHolding(symbol);
    } else {
        await portfolioModel.updateStockHolding(symbol, newQuantity, stockHolding.purchase_price, stockHolding.current_price);
    }

    await portfolioModel.updatePortfolioValue(portfolioId, newCashBalance, portfolio.total_value);

    return { success: true, newCashBalance };
};


const getTransactionsHistory = async () => {
    const portfolio = await portfolioModel.getPortfolio();
    if (!portfolio) {
        throw new Error('Portfolio not found. Please initialize it.');
    }
    return await portfolioModel.getTransactionsByPortfolioId(portfolio.id);
};


const getPortfolioTrendData = async () => {
    const portfolio = await portfolioModel.getPortfolio();
    if (!portfolio) {
        throw new Error('Portfolio not found. Please initialize it.');
    }

    // Get initial cash balance for the trend calculation
    const initialCash = portfolio.initial_cash;

    const transactions = await portfolioModel.getPortfolioHistoricalValue(portfolio.id, 7);

    const trendData = [];
    const dailyValues = {};

    // Initialize daily values for the past 7 days (including today)
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dailyValues[dateStr] = { cash: initialCash, stocks: 0, total: initialCash };
    }

    // Apply transactions chronologically to build up daily cash
    let currentCash = initialCash;
    let currentHoldings = {}; // {symbol: quantity}

    const sortedTransactions = (await portfolioModel.getTransactionsByPortfolioId(portfolio.id))
        .filter(t => new Date(t.transaction_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date));

    // Reconstruct daily cash and holdings
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        // Sum up cash changes until this date
        let cashOnDate = initialCash;
        let holdingsOnDate = {};

        for(const t of sortedTransactions) {
            const transactionDate = t.transaction_date.toISOString().split('T')[0];
            if (transactionDate <= dateStr) {
                if (t.type === 'buy') {
                    cashOnDate -= (t.quantity * t.price);
                    holdingsOnDate[t.symbol] = (holdingsOnDate[t.symbol] || 0) + t.quantity;
                } else if (t.type === 'sell') {
                    cashOnDate += (t.quantity * t.price);
                    holdingsOnDate[t.symbol] = (holdingsOnDate[t.symbol] || 0) - t.quantity;
                    if (holdingsOnDate[t.symbol] === 0) {
                        delete holdingsOnDate[t.symbol];
                    }
                }
            }
        }

        // Fetch historical prices for stocks held on that specific day
        let stockValueOnDate = 0;
        const symbolsOnDate = Object.keys(holdingsOnDate);

        if (symbolsOnDate.length > 0) {
            // This is the challenging part: need historical API for each stock on each date.
            // Yahoo Finance API provides historical data, but fetching it for multiple stocks
            // for specific past dates would be a loop of API calls.
            // For simplicity in this example, we will just use current prices as a fallback
            // or assume we have historical data available.
            // For a production app, you'd need a robust historical data fetching mechanism.

            // Placeholder: Use current prices if historical not available easily
            const currentStockPrices = await stockService.getMultipleCurrentData(symbolsOnDate);
            for (const symbol of symbolsOnDate) {
                const currentPriceData = currentStockPrices.find(data =>
                    data && data.body && data.body.price_data && data.body.price_data.ticker === symbol
                );
                const priceForDay = currentPriceData?.body?.price_data?.regularMarketPrice || 0; // Fallback to 0 if no price
                stockValueOnDate += holdingsOnDate[symbol] * priceForDay;
            }
        }

        dailyValues[dateStr] = {
            cash: cashOnDate,
            stocks: stockValueOnDate,
            total: cashOnDate + stockValueOnDate
        };
        trendData.push({ date: dateStr, value: dailyValues[dateStr].total });
    }

    return trendData.sort((a,b) => new Date(a.date) - new Date(b.date));
};

// New: Function to delete a transaction
const deleteTransaction = async (transactionId) => {
    // Before deleting the transaction, you might want to reverse its effect on portfolio cash and holdings.
    // This is a complex logic that depends on your business rules (e.g., what if the stock was sold later?).
    // For simplicity, this example only deletes the transaction record.
    // A robust solution would involve recalculating portfolio state or explicitly reversing the transaction.

    // First, get the transaction details to reverse its effect on cash balance and holdings
    const [transactions] = await pool.execute(
        'SELECT * FROM transactions WHERE id = ?',
        [transactionId]
    );
    const transaction = transactions[0];

    if (!transaction) {
        throw new Error('Transaction not found.');
    }

    const portfolio = await portfolioModel.getPortfolio();
    if (!portfolio) {
        throw new Error('Portfolio not found. Please initialize it.');
    }

    let newCashBalance = portfolio.cash_balance;
    let stockHolding = await portfolioModel.getStockHoldingBySymbol(transaction.symbol);

    if (transaction.type === 'buy') {
        // Reverse a buy: add cash back, reduce holdings
        newCashBalance += (transaction.quantity * transaction.price);
        if (stockHolding) {
            const newQuantity = stockHolding.quantity - transaction.quantity;
            if (newQuantity <= 0) {
                await portfolioModel.deleteStockHolding(transaction.symbol);
            } else {
                // Simplified: recalculate average purchase price if needed, or keep old for remaining
                // For now, just update quantity and keep old purchase price for remaining
                await portfolioModel.updateStockHolding(transaction.symbol, newQuantity, stockHolding.purchase_price, stockHolding.current_price);
            }
        }
    } else if (transaction.type === 'sell') {
        // Reverse a sell: deduct cash, increase holdings
        newCashBalance -= (transaction.quantity * transaction.price);
        if (stockHolding) {
            await portfolioModel.updateStockHolding(transaction.symbol, stockHolding.quantity + transaction.quantity, stockHolding.purchase_price, stockHolding.current_price);
        } else {
            // If selling caused holding to be deleted, re-add it (assuming purchase price is the selling price for reversal)
            await portfolioModel.addStockHolding(transaction.symbol, transaction.quantity, transaction.price);
        }
    }

    // Update portfolio cash balance (total_value will be recalculated on next overview fetch)
    await portfolioModel.updatePortfolioValue(portfolio.id, newCashBalance, portfolio.total_value);

    // Finally, delete the transaction record
    await portfolioModel.deleteTransaction(transactionId);

    return { success: true, newCashBalance };
};


module.exports = {
    initializePortfolio,
    getPortfolioOverview,
    buyStock,
    sellStock,
    getTransactionsHistory,
    getPortfolioTrendData,
    deleteTransaction,
};

