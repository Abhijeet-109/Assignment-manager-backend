const {verifyToken} = require('../utils/tokenUtils');

const protect = (req,res,next)=>{
    try{

        //1. This code will check the authorization header exist 
        const authHeader = req.headers['authorization'];
        if(!authHeader || !authHeader.startsWith('Bearer')){
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        //2. This block will extract token (remove 'bearer'prefix)
        const token = authHeader.split(' ')[1];

        //3. This will verify and decode.
        const decoded = verifyToken(token);

        //4.Attach user inof to the request 
        req.user = decoded;

        next();
    }catch (error){
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please login again',
        });
        
    }
    
};

module.exports = {protect};