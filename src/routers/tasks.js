const express = require('express')
const Task = require("../models/tasks")
const router =  new express.Router()
const auth = require('../middleware/auth')

router.post('/task', auth, async (req,res)=> {
    
    try {
        const task = await Task({...req.body,
            owner: req.user._id
        })
        await task.save()
        res.status(201).send(task)

    } catch(e) {
        res.status(500).send()
    }
      
})

//tasks?sorBy=createdAt:desc
router.get('/tasks', auth, async (req,res)=>{
    const match = {}
    const sort = {}
    if (req.query.completed) {
        match.Completed= req.query.completed ==='true'
    }
    
    const part = req.query.sortBy.split(':')
    if(part) {
        sort[part[0]]= part[1] === 'desc'? -1:1 
        console.log(sort)
    }
   
    
    try {
       // const task = await Task.find({owner:req.user._id})
            await req.user.populate({
            path:'tasks',
           match,
           options: {
           limit: parseInt(req.query.limit),
           skip: parseInt(req.query.skip),
           sort
           }
        
        }).execPopulate()
    
       res.send(req.user.tasks)
    } catch(e) {
        res.status(500).send()
    }
    
})

router.get('/tasks/:id', auth, async (req,res)=>{
    const _id= req.params.id
    try {
        const task = await Task.findOne({_id, owner: req.user._id})
        if (!task) {
            res.status(400).send("Not found")
        }
        res.status(200).send(task)
    } catch(e) {
        res.status(500).send()

    }
})


router.patch('/tasks/:id', auth, async (req,res)=>{
    const allowedUpdates = ['Completed', 'Description']
    console.log(req.body)
    const updates = Object.keys(req.body)
    const isValidUpdates = updates.every((update)=> allowedUpdates.includes(update))

    if (!isValidUpdates) {
        res.status(404).send('Invalid updates:')
    }
    try {
    
        const task= await Task.findOne({_id:req.params.id, owner:req.user._id})
        updates.forEach((update)=>task[update]=req.body[update])
        task.save()
        if (!task) {
            return res.status(404).send()
        }
        res.status(200).send(task)

    } catch(e) {
        res.status(500).send()
    }
})

router.delete("/task/:id", auth, async (req,res)=> 
{
    try {
        const _id = req.params.id
        const task = await Task.findOne({_id, owner:req.user._id})
        if(!task) {
            res.status(404).send('No such task')
        }
        delete task
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router