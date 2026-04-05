const db = require('../config/db');

const getDashboardSummary = async () => {
    // Total income, expenses, and current net balance
    const summaryQuery = `
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expenses
      FROM records
    `;

    // Category-wise totals
    const categoryQuery = `
      SELECT category, type, SUM(amount) AS total 
      FROM records 
      GROUP BY category, type 
      ORDER BY total DESC
    `;

    // Recent activity (last 5 records)
    const recentQuery = 'SELECT * FROM records ORDER BY date DESC LIMIT 5';

    // Monthly trends (last 6 months)
    const trendQuery = `
      SELECT 
        TO_CHAR(date, 'YYYY-MM') AS month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses
      FROM records
      WHERE date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY month
      ORDER BY month ASC
    `;

    // Parallel Execution
    const [summaryResult, categoryResult, recentResult, trendResult] = await Promise.all([
        db.query(summaryQuery),
        db.query(categoryQuery),
        db.query(recentQuery),
        db.query(trendQuery)
    ]);

    const summary = summaryResult.rows[0] || { total_income: 0, total_expenses: 0 };
    const totalIncome = parseFloat(summary.total_income || 0);
    const totalExpenses = parseFloat(summary.total_expenses || 0);
    const netBalance = totalIncome - totalExpenses;

    return {
        overall: {
            totalIncome,
            totalExpenses,
            netBalance,
        },
        categoryWise: categoryResult.rows,
        recentTransactions: recentResult.rows,
        trends: trendResult.rows,
    };
};

module.exports = {
    getDashboardSummary,
};
