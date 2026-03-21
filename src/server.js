const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const {protect} = require('./middleware/authMiddleware');
const { restrictTo } = require('./middleware/roleMiddleware');


const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

// Authentication routes 
app.use('/api/auth', authRoutes);

//Api health
app.get('/api/health',(req,res)=>{
    res.status(200).json({
        success: true,
        message: 'Server is Running Correctly',
        timestamp: new Date().toISOString(),
    });
});

// Protected test routes
app.get('/api/protected',protect, (req,res)=>{
    res.json({
        success: true,
        message: `Hello ${req.user.role}!`,user: req.user
    });
});

app.get('/api/admin-only',protect, restrictTo('admin'),(req,res)=>{
    res.json({
        success: true,
        message: 'Admin access confirmed.',
    });
});

//Error 404 Handling block 
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