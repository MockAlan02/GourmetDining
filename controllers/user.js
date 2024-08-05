const User = require('../models/user');

async function getAllUsers (req, res) {
    try {
        const users = await User.findAll();
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};

module.exports = {
    getAllUsers,
}