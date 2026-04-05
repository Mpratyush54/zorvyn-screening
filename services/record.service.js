const recordRepository = require('../repositories/record.repository');

const createRecord = async (recordData) => {
    if (!recordData.amount || !recordData.type || !recordData.category) {
        throw { statusCode: 400, message: 'Invalid record data' };
    }
    return await recordRepository.createRecord(recordData);
};

const getRecordsByFilter = async (filters = {}) => {
    return await recordRepository.getRecordsByFilter(filters || {});
};

const getRecordById = async (id) => {
    const record = await recordRepository.findRecordById(id);
    if (!record) {
        throw { statusCode: 404, message: 'Record not found' };
    }
    return record;
};

const updateRecord = async (id, updateData, currentUser) => {
    const record = await recordRepository.findRecordById(id);
    if (!record) {
        throw { statusCode: 404, message: 'Record not found' };
    }

    if (record.user_id !== currentUser.id && currentUser.role !== 'ADMIN') {
        throw { statusCode: 403, message: 'Access denied. You do not own this record.' };
    }

    return await recordRepository.updateRecord(id, updateData);
};

const deleteRecord = async (id, currentUser) => {
    const record = await recordRepository.findRecordById(id);
    if (!record) {
        throw { statusCode: 404, message: 'Record not found' };
    }

    if (record.user_id !== currentUser.id && currentUser.role !== 'ADMIN') {
        throw { statusCode: 403, message: 'Access denied. You do not own this record.' };
    }

    return await recordRepository.deleteRecord(id);
};

module.exports = {
    createRecord,
    getRecordsByFilter,
    getRecordById,
    updateRecord,
    deleteRecord,
};
