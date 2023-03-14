let imagePath = ''
const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const dbServices = require('./services/services')
const cors = require('cors')
const path = require('path')
require('dotenv').config()
const multer = require('multer')
app.use(express.json())
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
app.get('/get-details/:id',(req,res)=>{
      dbServices.getDetails(req.params.id).then((result)=>{
        res.status(result.statusCode).json(result)
    })
})
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null, 'uploads')
    },
    filename:(req,file,cb)=>{
        cb(null,imagePath=Date.now() + path.extname(file.originalname))
    }
})
const uploadImage = multer({storage:storage})
app.use('/uploads',express.static('uploads'))
app.post('/update-details',uploadImage.single('image'),(req,res)=>{
    const details = JSON.parse(req.body.details);
    let imageurl =`http://localhost:5000/uploads/${imagePath}`
    dbServices.updateDetails(details,imageurl).then((result)=>{
        res.status(result.statusCode).json(result)
    })
})
const port = process.env.PORT || 5000
server.listen(port ,()=>{
    console.log(`server started at port ${port}`)
})