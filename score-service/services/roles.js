const ConnectRoles = require('connect-roles');

const roles = new ConnectRoles({
    failureHandler: function (req, res, action) {
        res.status(403).json({ message: "Forbidden. You don't have the rights to do this action.", action: action });
    }
});

roles.use('participant', req => {
    if (req.user && roles.isAuthenticated()) {
        return req.user.roles.includes('participant');
    }
});

module.exports = roles;