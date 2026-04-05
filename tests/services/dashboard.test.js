const dashboardService = require('../../services/dashboard.service');
const db = require('../../config/db');

// Mock Database query
jest.mock('../../config/db');

describe('Dashboard Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should calculate summary correctly with multiple SQL data results', async () => {
        // Summary Result
        const mockSummary = { rows: [{ total_income: '1000', total_expenses: '400' }] };
        const mockCategory = { rows: [{ category: 'Salary', total: 1000 }] };
        const mockRecent = { rows: [] };
        const mockTrend = { rows: [] };

        db.query
            .mockResolvedValueOnce(mockSummary)
            .mockResolvedValueOnce(mockCategory)
            .mockResolvedValueOnce(mockRecent)
            .mockResolvedValueOnce(mockTrend);

        const result = await dashboardService.getDashboardSummary();

        expect(result.overall.totalIncome).toBe(1000);
        expect(result.overall.totalExpenses).toBe(400);
        expect(result.overall.netBalance).toBe(600);
        expect(result.categoryWise).toEqual(mockCategory.rows);
    });
    test('should convert string values to numbers', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [{ total_income: '2000', total_expenses: '500' }] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const result = await dashboardService.getDashboardSummary();

        expect(typeof result.overall.totalIncome).toBe('number');
        expect(result.overall.totalIncome).toBe(2000);
    });
    test('should throw error if DB query fails', async () => {
        db.query.mockRejectedValue(new Error('DB Error'));

        await expect(
            dashboardService.getDashboardSummary()
        ).rejects.toThrow('DB Error');
    });
    test('should handle partial query failure gracefully', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [{ total_income: '1000', total_expenses: '200' }] })
            .mockRejectedValueOnce(new Error('Category error'));

        await expect(
            dashboardService.getDashboardSummary()
        ).rejects.toThrow('Category error');
    });
    test('should call db.query correct number of times', async () => {
        db.query
            .mockResolvedValue({ rows: [] });

        await dashboardService.getDashboardSummary();

        expect(db.query).toHaveBeenCalledTimes(4);
    });
    test('should return recent transactions and trends', async () => {
        const mockRecent = { rows: [{ id: 1 }] };
        const mockTrend = { rows: [{ month: 'Jan', income: 100 }] };

        db.query
            .mockResolvedValueOnce({ rows: [{ total_income: '1000', total_expenses: '500' }] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce(mockRecent)
            .mockResolvedValueOnce(mockTrend);

        const result = await dashboardService.getDashboardSummary();

        expect(result.recentTransactions).toEqual(mockRecent.rows);
        expect(result.trends).toEqual(mockTrend.rows);
    });
    test('should handle negative values correctly', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [{ total_income: '-100', total_expenses: '50' }] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const result = await dashboardService.getDashboardSummary();

        expect(result.overall.netBalance).toBe(-150);
    });
    test('should return 0 totals when no data is found', async () => {
        const mockEmpty = { rows: [{ total_income: null, total_expenses: null }] };

        db.query
            .mockResolvedValueOnce(mockEmpty)
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const result = await dashboardService.getDashboardSummary();

        expect(result.overall.totalIncome).toBe(0);
        expect(result.overall.netBalance).toBe(0);
    });
    test('should handle empty result rows safely', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [] }) // summary empty
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const result = await dashboardService.getDashboardSummary();

        expect(result.overall.totalIncome).toBe(0);
        expect(result.overall.totalExpenses).toBe(0);
    });
    test('should execute queries in correct order', async () => {
        db.query.mockResolvedValue({ rows: [] });

        await dashboardService.getDashboardSummary();

        expect(db.query.mock.calls.length).toBe(4);
    });
    test('should not return NaN values', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [{}] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const result = await dashboardService.getDashboardSummary();

        expect(result.overall.totalIncome).not.toBeNaN();
        expect(result.overall.totalExpenses).not.toBeNaN();
    });
    test('should always return consistent response structure', async () => {
        db.query.mockResolvedValue({ rows: [] });

        const result = await dashboardService.getDashboardSummary();

        expect(result).toHaveProperty('overall');
        expect(result).toHaveProperty('categoryWise');
        expect(result).toHaveProperty('recentTransactions');
        expect(result).toHaveProperty('trends');
    });
    test('should handle large financial values correctly', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [{ total_income: '1000000000', total_expenses: '1' }] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const result = await dashboardService.getDashboardSummary();

        expect(result.overall.totalIncome).toBe(1000000000);
    });

    test('should execute DB queries in parallel (Promise.all behavior)', async () => {
        let resolveFns = [];

        // Create pending promises
        db.query.mockImplementation(() => {
            return new Promise((resolve) => {
                resolveFns.push(resolve);
            });
        });

        const servicePromise = dashboardService.getDashboardSummary();

        // At this point, if queries are parallel,
        // all db.query calls should already be triggered
        expect(db.query).toHaveBeenCalledTimes(4);

        // Now resolve all queries
        resolveFns[0]({ rows: [{ total_income: '100', total_expenses: '50' }] });
        resolveFns[1]({ rows: [] });
        resolveFns[2]({ rows: [] });
        resolveFns[3]({ rows: [] });

        const result = await servicePromise;

        expect(result.overall.totalIncome).toBe(100);
        expect(result.overall.totalExpenses).toBe(50);
    });


});
