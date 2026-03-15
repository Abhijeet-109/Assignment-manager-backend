const mongoose = require('mongoose');

const connectDB = async ()=>{

    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB connected: ${conn.connection.jost}`);
        return conn;

    }
    catch(error){
        console.error(`X MongoDB connection failed: ${error.message}`);
        process.exit(1);

    }
};

module.exports = connectDB;