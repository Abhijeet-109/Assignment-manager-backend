const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.get('/api/health',(req,res)=>{
    res.status(200).json({
        success: true,
        message: 'Server is Running Correctly',
        timestamp: new Date().toISOString(),
    });
});

app.use((req,res)=>{
    res.status(400).json({
        success: false,
        message: 'Routing not found',
    });
});

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;