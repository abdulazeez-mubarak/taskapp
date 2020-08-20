const User = require ('../models/users')
const jwt = require('jsonwebtoken')

const auth = async (req,res,next)=>{
    try {
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,'thisismysecret')
        const user = await User.findOne({_id:decoded._id, 'tokens.token':token})
        if (!user) {
            throw new Error('Authorization error')
        }
        req.user=user 
        req.token=token
        next()
    } catch (e) {
        res.status(401).send({'error':'Please authenticate!'})
    }

}

module.exports = auth