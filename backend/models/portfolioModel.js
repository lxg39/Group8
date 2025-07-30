const pool = require('./db');

// Portfolio Management
const getPortfolio = async () => {
    // Assuming there's always only one portfolio (for the single user)
    const [rows] = await pool.execute(
        'SELECT id, cash_balance, total_value, initial_cash FROM portfolios LIMIT 1'
    );
    return rows[0];
};

const createInitialPortfolio = async (initialCash = 0) => {
    // This function should be called only once to initialize the portfolio
    const [result] = await pool.execute(
        'INSERT INTO portfolios (cash_balance, total_value, initial_cash) VALUES (?, ?, ?)',
        [initialCash, initialCash, initialCash]
    );
    return result.insertId;
};

const updatePortfolioValue = async (portfolioId, newCashBalance, newTotalValue) => {
    await pool.execute(
        'UPDATE portfolios SET cash_balance = ?, total_value = ?, updated_at = NOW() WHERE id = ?',
        [newCashBalance, newTotalValue, portfolioId]
    );
};

// Transaction Management
const recordTransaction = async (portfolioId, symbol, type, quantity, price) => {
    const [result] = await pool.execute(
        'INSERT INTO transactions (portfolio_id, symbol, type, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [portfolioId, symbol, type, quantity, price]
    );
    return result.insertId;
};

const getTransactionsByPortfolioId = async (portfolioId) => {
    const [rows] = await pool.execute(
        'SELECT id, symbol, type, quantity, price, transaction_date FROM transactions WHERE portfolio_id = ? ORDER BY transaction_date DESC',
        [portfolioId]
    );
    return rows;
};

const getAllTransactions = async () => {
  const [rows] = await pool.execute('SELECT id, symbol, type, quantity, price, transaction_date FROM transactions ORDER BY transaction_date DESC');
  return rows;
};

// stock Holdings Management (using the 'stockholdings' table)
const getStockHoldingBySymbol = async (symbol) => {
    // Assuming 'stockholdings' table is directly for the single portfolio
    const [rows] = await pool.execute(
        'SELECT id, stock_symbol, quantity, purchase_price, current_price FROM stockholdings WHERE stock_symbol = ?',
        [symbol]
    );
    return rows[0];
};

const addStockHolding = async (symbol, quantity, purchasePrice) => {
    const [result] = await pool.execute(
        'INSERT INTO stockholdings (stock_symbol, quantity, purchase_price) VALUES (?, ?, ?)',
        [symbol, quantity, purchasePrice]
    );
    return result.insertId;
};

// TODO: update one column, others remain use old value
const updateStockHolding = async (symbol, newQuantity, newPurchasePrice, newCurrentPrice) => {
    await pool.execute(
        'UPDATE stockholdings SET quantity = ?, purchase_price = ?, current_price = ? WHERE stock_symbol = ?',
        [newQuantity, newPurchasePrice, newCurrentPrice, symbol]
    );
};

const deleteStockHolding = async (symbol) => {
    await pool.execute(
        'DELETE FROM stockholdings WHERE stock_symbol = ?',
        [symbol]
    );
};

const getAllStockHoldings = async () => {
    const [rows] = await pool.execute(
        'SELECT id, stock_symbol, quantity, purchase_price, current_price FROM stockholdings WHERE quantity > 0'
    );
    return rows;
};

const getPortfolioHistoricalValue = async (portfolioId, days = 7) => {
    // This is a placeholder. A more robust solution would calculate portfolio value daily.
    // For now, let's focus on cash impact from transactions for the trend.
    const [rows] = await pool.execute(
        `
        SELECT
            DATE(transaction_date) as date,
            SUM(CASE WHEN type = 'buy' THEN -quantity * price ELSE quantity * price END) as cash_impact
        FROM
            transactions
        WHERE
            portfolio_id = ?
            AND transaction_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY
            DATE(transaction_date)
        ORDER BY
            date ASC;
        `,
        [portfolioId, days]
    );
    return rows;
};

module.exports = {
    getPortfolio,
    createInitialPortfolio,
    updatePortfolioValue,
    recordTransaction,
    getTransactionsByPortfolioId,
    getAllTransactions,
    getStockHoldingBySymbol,
    addStockHolding,
    updateStockHolding,
    deleteStockHolding,
    getAllStockHoldings,
    getPortfolioHistoricalValue,
};