const recordService = require('../../services/record.service');
const recordRepository = require('../../repositories/record.repository');

// Mock Record Repo
jest.mock('../../repositories/record.repository');

describe('Record Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockRecord = {
        id: 1,
        amount: 100,
        type: 'income',
        category: 'Testing',
        user_id: 1
    };

    // ================= CREATE =================
    describe('createRecord', () => {

        test('should successfully create a financial record', async () => {
            recordRepository.createRecord.mockResolvedValue(mockRecord);

            const result = await recordService.createRecord(mockRecord);

            expect(recordRepository.createRecord).toHaveBeenCalledWith(mockRecord);
            expect(result).toEqual(mockRecord);
        });

        test('should throw error for invalid record data', async () => {
            await expect(
                recordService.createRecord({ amount: null })
            ).rejects.toBeDefined();
        });

        test('should handle repository failure during create', async () => {
            recordRepository.createRecord.mockRejectedValue(new Error('DB Error'));

            await expect(
                recordService.createRecord(mockRecord)
            ).rejects.toThrow('DB Error');
        });

    });

    // ================= GET =================
    describe('getRecordsByFilter', () => {

        test('should successfully retrieve records with filter', async () => {
            const records = [mockRecord];

            recordRepository.getRecordsByFilter.mockResolvedValue(records);

            const result = await recordService.getRecordsByFilter({ type: 'income' });

            expect(recordRepository.getRecordsByFilter)
                .toHaveBeenCalledWith({ type: 'income' });

            expect(result).toEqual(records);
        });

        test('should return empty array if no records found', async () => {
            recordRepository.getRecordsByFilter.mockResolvedValue([]);

            const result = await recordService.getRecordsByFilter({});

            expect(result).toEqual([]);
        });

        test('should handle repository failure during fetch', async () => {
            recordRepository.getRecordsByFilter.mockRejectedValue(new Error('DB Error'));

            await expect(
                recordService.getRecordsByFilter({})
            ).rejects.toThrow('DB Error');
        });

    });

    // ================= UPDATE =================
    describe('updateRecord', () => {

        test('should throw 404 if record to update is not found', async () => {
            recordRepository.findRecordById.mockResolvedValue(null);

            await expect(
                recordService.updateRecord(999, { amount: 200 }, { id: 1 })
            ).rejects.toMatchObject({
                statusCode: 404,
                message: 'Record not found'
            });
        });

        test('should not allow updating record of another user', async () => {
            const record = { ...mockRecord, user_id: 2 };

            recordRepository.findRecordById.mockResolvedValue(record);

            await expect(
                recordService.updateRecord(1, { amount: 200 }, { id: 1 })
            ).rejects.toMatchObject({
                statusCode: 403
            });
        });

        test('should update record successfully if found', async () => {
            recordRepository.findRecordById.mockResolvedValue(mockRecord);

            recordRepository.updateRecord.mockResolvedValue({
                ...mockRecord,
                amount: 500
            });

            const result = await recordService.updateRecord(
                mockRecord.id,
                { amount: 500 },
                { id: 1 }
            );

            expect(recordRepository.updateRecord).toHaveBeenCalledWith(
                mockRecord.id,
                { amount: 500 }
            );

            expect(result.amount).toBe(500);
        });

        test('should update only provided fields', async () => {
            recordRepository.findRecordById.mockResolvedValue(mockRecord);

            recordRepository.updateRecord.mockResolvedValue({
                ...mockRecord,
                amount: 300
            });

            const result = await recordService.updateRecord(
                mockRecord.id,
                { amount: 300 },
                { id: 1 }
            );

            expect(result.amount).toBe(300);
            expect(result.category).toBe(mockRecord.category);
        });

        test('should handle repository failure during update', async () => {
            recordRepository.findRecordById.mockResolvedValue(mockRecord);
            recordRepository.updateRecord.mockRejectedValue(new Error('DB Error'));

            await expect(
                recordService.updateRecord(mockRecord.id, { amount: 200 }, { id: 1 })
            ).rejects.toThrow('DB Error');
        });

    });

    // ================= DELETE =================
    describe('deleteRecord', () => {

        test('should throw 404 if record to delete is not found', async () => {
            recordRepository.findRecordById.mockResolvedValue(null);

            await expect(
                recordService.deleteRecord(999, { id: 1 })
            ).rejects.toMatchObject({
                statusCode: 404,
                message: 'Record not found'
            });
        });

        test('should not allow deleting record of another user', async () => {
            const record = { ...mockRecord, user_id: 2 };

            recordRepository.findRecordById.mockResolvedValue(record);

            await expect(
                recordService.deleteRecord(1, { id: 1 })
            ).rejects.toMatchObject({
                statusCode: 403
            });
        });

        test('should delete record successfully if found', async () => {
            recordRepository.findRecordById.mockResolvedValue(mockRecord);
            recordRepository.deleteRecord.mockResolvedValue(mockRecord.id);

            const result = await recordService.deleteRecord(
                mockRecord.id,
                { id: 1 }
            );

            expect(recordRepository.deleteRecord)
                .toHaveBeenCalledWith(mockRecord.id);

            expect(result).toBe(mockRecord.id);
        });

        test('should handle repository failure during delete', async () => {
            recordRepository.findRecordById.mockResolvedValue(mockRecord);
            recordRepository.deleteRecord.mockRejectedValue(new Error('DB Error'));

            await expect(
                recordService.deleteRecord(mockRecord.id, { id: 1 })
            ).rejects.toThrow('DB Error');
        });
        test('should not call findRecordById during create', async () => {
            recordRepository.createRecord.mockResolvedValue(mockRecord);

            await recordService.createRecord(mockRecord);

            expect(recordRepository.findRecordById).not.toHaveBeenCalled();
        });
        test('should pass correct user_id when creating record', async () => {
            recordRepository.createRecord.mockResolvedValue(mockRecord);

            await recordService.createRecord({ ...mockRecord, user_id: 1 });

            expect(recordRepository.createRecord).toHaveBeenCalledWith(
                expect.objectContaining({ user_id: 1 })
            );
        });
        test('should not call updateRecord if user is unauthorized', async () => {
            const record = { ...mockRecord, user_id: 2 };

            recordRepository.findRecordById.mockResolvedValue(record);

            await expect(
                recordService.updateRecord(1, { amount: 200 }, { id: 1 })
            ).rejects.toBeDefined();

            expect(recordRepository.updateRecord).not.toHaveBeenCalled();
        });
        test('should not call deleteRecord if user is unauthorized', async () => {
            const record = { ...mockRecord, user_id: 2 };

            recordRepository.findRecordById.mockResolvedValue(record);

            await expect(
                recordService.deleteRecord(1, { id: 1 })
            ).rejects.toBeDefined();

            expect(recordRepository.deleteRecord).not.toHaveBeenCalled();
        });
        test('should not call deleteRecord if record does not exist', async () => {
            recordRepository.findRecordById.mockResolvedValue(null);

            await expect(
                recordService.deleteRecord(999, { id: 1 })
            ).rejects.toBeDefined();

            expect(recordRepository.deleteRecord).not.toHaveBeenCalled();
        });
        test('should not call updateRecord if record does not exist', async () => {
            recordRepository.findRecordById.mockResolvedValue(null);

            await expect(
                recordService.updateRecord(999, { amount: 200 }, { id: 1 })
            ).rejects.toBeDefined();

            expect(recordRepository.updateRecord).not.toHaveBeenCalled();
        });
        test('should handle invalid filter input safely', async () => {
            recordRepository.getRecordsByFilter.mockResolvedValue([]);

            const result = await recordService.getRecordsByFilter(null);

            expect(result).toEqual([]);
        });
    });
});

