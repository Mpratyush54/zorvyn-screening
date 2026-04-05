const recordService = require('../services/record.service');
const { successResponse } = require('../utils/response');

const createRecord = async (req, res, next) => {
    try {
        const recordData = { ...req.body, user_id: req.user.id };
        const record = await recordService.createRecord(recordData);
        return successResponse(res, record, 'Record created successfully', 201);
    } catch (error) {
        next(error);
    }
};

const getRecords = async (req, res, next) => {
    try {
        const records = await recordService.getRecordsByFilter(req.query);
        return successResponse(res, records, 'Records retrieved successfully');
    } catch (error) {
        next(error);
    }
};

const getRecordById = async (req, res, next) => {
    try {
        const record = await recordService.getRecordById(req.params.id);
        return successResponse(res, record, 'Record retrieved successfully');
    } catch (error) {
        next(error);
    }
};

const updateRecord = async (req, res, next) => {
    try {
        const record = await recordService.updateRecord(req.params.id, req.body, req.user);
        return successResponse(res, record, 'Record updated successfully');
    } catch (error) {
        next(error);
    }
};

const deleteRecord = async (req, res, next) => {
    try {
        await recordService.deleteRecord(req.params.id, req.user);
        return successResponse(res, null, 'Record deleted successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createRecord,
    getRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
};
