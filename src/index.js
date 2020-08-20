const express= require ('express')
require('./db/mongoose.js')
const User = require('./models/users.js')
const Task = require('./models/tasks.js')
const userRouter = require('./routers/users.js')
const taskRouter =  require('./routers/tasks.js')
const auth = require('./middleware/auth')
const { ObjectId } = require('mongodb')
const multer = require('multer')


const port = process.env.PORT
const app = express()

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

// const main = async ()=> {
//     const user = await User.findOne(ObjectId('5f3beb93705c093a9068e2f6'))
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
//     }
//     main()


app.listen(port, ()=> {
    console.log('Server is up and running!')
})

 