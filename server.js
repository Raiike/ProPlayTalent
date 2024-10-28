const express = require("express")
const mongoose = require('mongoose')
const session = require('express-session')
const userRouter = require('./routes/userRouter');
const managerRouter = require('./routes/managerRouter');
const adminRouter = require('./routes/adminRouter');
require('dotenv').config()

const app = express()
app.use(express.static('./publics'))
app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: process.env.CRYPTSESS
}))
app.use(express.urlencoded({extended: true}))
app.use(userRouter)
app.use(managerRouter)
app.use(adminRouter)

app.listen(process.env.PORT, (err)=>{
    if (err) {s
        console.log(err);
    }else{
        console.log("connecté au serveur");
    }
})


mongoose.connect(process.env.MONGO)
