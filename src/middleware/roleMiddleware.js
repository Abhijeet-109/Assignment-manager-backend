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

module.exports = { authorizeRoles};