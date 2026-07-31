// requireRole.js 

const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if(!req.user) return res.sendStatus(401);

        if(allowedRoles.includes(req.user.role)){
            next();
        } else {
            res.sendStatus(403);
        }
    }
}

module.exports = requireRole;