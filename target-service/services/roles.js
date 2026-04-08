const ConnectRoles = require('connect-roles');

const roles = new ConnectRoles({
    failureHandler: function (req, res, action) {
        res.status(403).json({ message: "Forbidden. You don't have the rights to do this action.", action: action });
    }
});

roles.use('target-owner', req => {
    if (req.user && roles.isAuthenticated()) {
        return req.user.sub === req.targetOrganizerId;
    }
});

module.exports = roles;