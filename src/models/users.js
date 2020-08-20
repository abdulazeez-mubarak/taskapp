const validator = require ('validator')
const mongoose = require('mongoose')
const bcrypt =  require('bcryptjs')
const { response } = require('express')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        trim: true
            }, 
    email: {
        type: String,
        required: true, 
        unique:true,
        trim: true,
        lowercase: true,
        validate (value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid Email')
        } 
    }
}, 
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
       validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('You can\'t use "password" as your password')
        }

        
    }
    },
    tokens: [{
        token:{
            type: String,
            required: true
        }}],
    avatar:{
            type:Buffer,
            defaut: undefined
        }
     


},
 {timestamps:true})


userSchema.pre('save', async function(next) {
const user = this 
if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)

}
next()
})

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({'_id':user._id.toString()}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token

}

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}
userSchema.statics.findByCredentials = async function (email, password) {
    const user =await User.findOne({email})
    if (!user) {
        throw new Error('Unable to login')}
    const loginPass = await bcrypt.compare(password,user.password)
    if (!loginPass) {
        throw new Error('Unable to login')
    }
  return user
}

userSchema.virtual('tasks', {
    ref:'Task',
    localField: '_id',
    foreignField: 'owner'
})
const User = mongoose.model('User', userSchema )

module.exports = User