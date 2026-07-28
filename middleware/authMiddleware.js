// authMiddleware.js 

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.Authorization || req.headers.authorization;
    if(!authHeader) return res.sendStatus(401);

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if(!decoded.userid) throw new Error('userid not found');

        req.user = { userid: decoded.userid }
        next();
    } catch(error) {
        console.log(error.message);
        return res.sendStatus(403);
    }
}

module.exports = {
    authMiddleware
}