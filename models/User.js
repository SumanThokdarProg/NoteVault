const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: [true, 'password is required'],
        minlength: [8, 'password require minimum 8 characters']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
},
    { timestamps: true }
)


module.exports = mongoose.model('User', userSchema);