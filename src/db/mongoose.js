const mongoose = require('mongoose')


mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true }).then((response)=>{
    console.log('Successfully connected!')
}).catch((error)=>{
    console.log("Error connecting to mubarak database")
})


