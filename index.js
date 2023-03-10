const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const dbServices = require('./services/services')
const cors = require('cors')
require('dotenv').config()
const io = require('socket.io')(server,{
    cors:{
        origin: ['http://localhost:3000']
    }
});

app.use(express.json())
app.use(cors({
    origin:'http://localhost:3000'
}))
app.post('/register',(req,res)=>{
    dbServices.userRegistration(req.body).then((result)=>{
        res.status(result.statusCode).json(result)
    })
})

app.post('/login',(req,res)=>{
      dbServices.userLogin(req.body).then((result)=>{
        res.status(result.statusCode).json(result)
    })
})

const port = process.env.PORT || 5000
server.listen(port ,()=>{
    console.log(`server started at port ${port}`)
   
})