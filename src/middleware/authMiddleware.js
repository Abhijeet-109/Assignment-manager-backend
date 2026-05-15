const { verifyToken } = require('../utils/tokenUtils');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        const user = await User.findById(decoded._id).select('_id role firstName lastName email avatar tokenVersion isSuperAdmin status');

        const dbVersion = user?.tokenVersion ?? 0;
        const tokenV = decoded.tokenVersion ?? -1; // old tokens without version get -1

        if (!user || dbVersion !== tokenV) {
            return res.status(401).json({
                success: false,
                message: 'Session expired. Please login again.'
            });
        }


        // Acount Deactivation -- Login access denied 
        if (user.status === 'inactive') {
            return res.status(403).json({
                success: false,
                message: 'Account deactivated. Contact Admin.'
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please login again.'
        });
    }
};

module.exports = { protect };