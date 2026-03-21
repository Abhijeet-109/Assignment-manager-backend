const jwt = require('jsonwebtoken');

const generateToken = (UserId, role)=>{
    return jwt.sign(
        { 
            _id: UserId, role
        },
        process.env.JWT_SECRET,
        {expiresIn:'24h'}

    );
};

const verifyToken = (token)=>{
    return jwt.verify(token,process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken};