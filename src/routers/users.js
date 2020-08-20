const express = require('express')
const User = require("../models/users")
const { findById } = require('../models/users')
const router =  new express.Router()
const auth = require('../middleware/auth')
const multer= require ('multer')
const { request } = require('express')
const sharp = require('sharp')
const {sendWelcomeEmail, sendCancellationEmail} = require('../email/account')


router.post('/users', async (req,res)=>{
    const user= new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch(e) {
            res.status(400).send(e)
    }
})

router.post ('/users/login', async (req,res)=>{
    try {
        const user = await User.findByCredentials (req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({user,token})
    } catch (e) {
        res.status(500).send(e)
        throw new Error(e)
    }
})

router.get('/users/me', auth, async (req,res)=>{
    res.send(req.user)
})

router.post('/users/logout', auth, async (req,res)=> {
   try { 
            req.user.tokens = req.user.tokens.filter((token)=> token.token !== req.token)
            await req.user.save()
            res.send('Logout!')
   } catch(e) {
       res.status(500).send()
   }
})

const upload = multer ({
    limits: {
        fileSize: 1000000
    }, 
    fileFilter(req,file,cb) {
        if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
            return cb(new Error('Please upload accepted format'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width: 250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next)=>res.status(400).send({error:error.message})

) 

router.delete ('/users/me/avatar', auth, async (req,res)=> {
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send()
})

router.post('/users/logoutAll', auth, async (req,res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send('Logout from all devices!')

    } catch(e) {
        res.status(400).send()
    }
})

router.get('/users/:id/avatar', async (req,res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user|| !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch(e) { 
        res.status(404).send()

    }
})


router.patch('/users/me', auth, async (req,res)=> {
    const allowedUpdates =["name", "password", "email"]
    const updates = Object.keys(req.body)
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidUpdate) {
        res.status(404).send("Invalid update:")
    }
    try { 
      const user= req.user
      updates.forEach((update) => user[update]=req.body[update]);
      req.user.save()
      res.send(req.user)
   } catch(e) {
       res.status(500).send(e)
       throw new Error(e)
   }
})

router.delete('/user/me', auth, async (req, res)=>{
   

   try { 
       sendCancellationEmail (req.user.email, req.user.name)
       req.user.remove()
       res.status(200).send(req.user)   
} catch(e) {
       res.status(500).send(e)
   }
})

module.exports = router