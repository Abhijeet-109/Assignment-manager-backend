//Role based access middleware block 
const authorizeRoles = (...roles) =>{
    return (req,res,next)=>{
        if (!roles.includes(req.user.role)){
            return res.status(403).json({
                success: false,
                message: `Access denied. ${req.user.role}s cannot access this route.`,
            });
        }
        next();
    };
}

const requireSuperAdmin = (req, res, next) => {
    if (!req.user.isSuperAdmin) {
        return res.status(403).json({ success: false, message: 'Super Admin access required.' });
    }
    next();
};

module.exports = { authorizeRoles, requireSuperAdmin};