// userController.js
const User = require('../models/User');
const Note = require('../models/Note');
const mongoose = require('mongoose');

const getAllUsers = async (req, res) => {
    try {
        // const filter = (req.query.from && req.query.to) 
        //     ? { createdAt: { $gte: req.query.from, $lte: req.query.to }}
        //     : (req.query.from) 
        //     ? { createdAt: { $gte: req.query.from }}
        //     : (req.query.to)
        //     ? { createdAt: { $lte: req.query.to }}
        //     : {};
        const filter = {};
        if (req.query.from || req.query.to) {
            filter.createdAt = {};
            if (req.query.from) filter.createdAt.$gte = req.query.from;
            if (req.query.to) filter.createdAt.$lte = req.query.to;
        }

        const result = await User.find(filter, { password: 0 });
        res.json(result);
    } catch(err) {
        res.sendStatus(500);
    }
}

module.exports = { 
    getAllUsers
};