const mongoose = require('mongoose');

const Target = mongoose.model('Target');
const Register = mongoose.model('Register');

async function fetchTargetId(req, res, next) {
    try {
        const targetData = await Target.findById(req.params.targetId).lean(); // `lean()` for plain JS object
        req.targetOrganizerId = targetData?.organizerId;
        
        next();
    } catch (error) {
        console.error('Failed to fetch target ID:', error);
        
        req.targetOrganizerId = null;
        next(error);
    }
}

async function isRegistered(req, res, next) {
    try {
        const registerExists = await Register.exists({ targetId: req.params.targetId, userUid: req.user.sub }).lean();

        req.isRegistered = registerExists ? true : false;
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