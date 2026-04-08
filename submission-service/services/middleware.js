const mongoose = require('mongoose');
const circuitBreaker = require('./circuit-breaker');
const TargetId = mongoose.model('TargetId');

async function fetchTargetId(req, res, next) {
    try {
        const targetIdData = await TargetId.findById(req.params.targetId).lean(); // `lean()` for plain JS object
        req.targetOrganizerId = targetIdData?.organizerId;
        
        next();
    } catch (error) {
        console.error('Failed to fetch target ID:', error);
        
        req.targetOrganizerId = null;
        next(error);
    }
}

async function isRegistered(req, res, next) {
    try {
        const { json, status } = await circuitBreaker.fire(
            'get',
            process.env.REGISTER_SERVICE,
            `targets/${req.params.targetId}/registers/check`,
            null,
            { authorization: req.headers.authorization }
        );

        req.isRegistered = (status === 200 && json.register) ? true : false;

        next();
    } catch (error) {
        console.error('Registration check failed:', error);
        
        req.isRegistered = false;
        next(error);
    }
}

module.exports = {
    fetchTargetId,
    isRegistered
};