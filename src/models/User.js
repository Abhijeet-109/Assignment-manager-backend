const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');


const UserSchema = new mongoose.Schema(
    {
        firstName : {
            type : String,
            required: [true,'First Name is required'],
            trim: true,
            minlength: [2,'Min 2 Characters'],
            maxlength: [50,'Max Characters'],
        },

        lastName: {
            type: String,
            required: [true,'Last Name is Required'],
            trim: true,
            minlength: [2,'Min 2 Characters'],
            maxlength: [50,'Max Characters'],
        },

        email: {
            type: String,
            required: [true,'Email is required'],
            trim: true,
            lowercase: true,
            unique: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
        },

        password: {
            type: String,
            required: [true,'Password is required'],
            minlength:[8,'Min 8 Characters'],
            select: false,
        },

        role: {
            type: String,
            enum: ['admin','teacher','student'],
            default: 'student',
        },

        status:{
            type: String,
            enum: ['active','inactive'],
            default: 'active',
        },

        lastlogin: {
            type: Date,
            default: null,
        },
    },
    {timestamps:true}
);

UserSchema.pre('save',async function (){

    if (!this.isModified('password'))return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    
});

UserSchema.methods.comparePassword = async function (entered) {
    return bcrypt.compare(entered,this.password);
};

module.exports = mongoose.model('User',UserSchema);