//Part A : Signup 
//Part A : Signup 
const User = require('../models/User');
const Student = require('../models/Student');
const { generateToken } = require('../utils/tokenUtils');

const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password,
            enrollmentNumber, division, semester, department
        } = req.body;

        // 1. Base field validation
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
        }

        // 2. Student profile fields validation
        if (!enrollmentNumber || !division || !semester || !department) {
            return res.status(400).json({ success: false, message: 'Enrollment number, division, semester and department are required.' });
        }

        // 3. Duplicate email check
        const exist = await User.findOne({ email: email.toLowerCase() });
        if (exist) {
            return res.status(400).json({ success: false, message: 'Email is already registered.' });
        }

        // 4. Create User (role is always student from register form)
        const user = await User.create({ firstName, lastName, email, password, role: 'student' });

        // 5. Create Student profile linked to this user
        await Student.create({
            userId: user._id,
            enrollmentNumber: enrollmentNumber.toUpperCase(),
            division,
            semester: Number(semester),
            department,
        });

        // 6. Generate token and respond
        const token = generateToken(user._id, user.role, user.tokenVersion);

        res.status(201).json({
            success: true,
            message: 'Account created successfully.',
            data: {
                token,
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                },
            },
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const msg = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: msg.join(', ') });
        }
        // Handle duplicate enrollment number
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Enrollment number already exists.' });
        }
        console.log('Signup Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Part B: Login Control

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password.',
            });
        }

        //Must use .select('+password') because we set select :false in the schema 
        const user = await User.findOne({
            email: email.toLowerCase()
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        if (user.status === 'inactive') {
            return res.status(403).json({
                seccess: false,
                message: 'Account deactivated. Contact Admin.'

            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email and password.',
            });
        }

        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        const token = generateToken(user._id, user.role, user.tokenVersion);

        res.status(200).json({
            success: true,
            message: 'Login successful.',
            data: {
                token,
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    lastLogin: user.lastLogin,
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
        return console.log('Server Error', error);
    }
};

module.exports = { signup, login };