const mongoose = require('mongoose');
const Target = mongoose.model('Target');

async function fetchTargetId(req, res, next) {
    try {
        const targetData = await Target.findOne({ _id: req.params.id, organizerId: req.user.sub }).lean(); // `lean()` for plain JS object
        req.targetOrganizerId = targetData?.organizerId;
        
        next();
    } catch (error) {
        console.error('Failed to fetch target ID:', error);
        
        req.targetOrganizerId = null;
        next(error);
    }
}

module.exports = {
    fetchTargetId
};