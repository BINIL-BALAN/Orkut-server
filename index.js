let imagePath = ''
let postImagePath = ''
const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const dbServices = require('./services/services')
const cors = require('cors')
const path = require('path')
require('dotenv').config()
const multer = require('multer')
app.use('/uploads', express.static('uploads'))
app.use(express.json())
const io = require('socket.io')(server, {
    cors: {
        origin: ['http://localhost:3000']
    }
});
//http://localhost:3000
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000'
}))

//*** register ***
app.post('/register', (req, res) => {
    dbServices.userRegistration(req.body).then((result) => {
        res.status(result.statusCode).json(result)
    })
})

//*** login ***
app.post('/login', (req, res) => {
    dbServices.userLogin(req.body).then((result) => {
        res.status(result.statusCode).json(result)
    })
})

//*** Fetch profile details ***
app.get('/get-details/:id', (req, res) => {
    dbServices.getDetails(req.params.id).then((result) => {
        res.status(result.statusCode).json(result)
    })
})

//*** Update profile details ***
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/dp')
    },
    filename: (req, file, cb) => {
        cb(null, imagePath = Date.now() + path.extname(file.originalname))
    }
})

const uploadImage = multer({ storage: storage })
app.post('/update-details', uploadImage.single('image'), (req, res) => {
    const details = JSON.parse(req.body.details);
    console.log('display image path',imagePath);
    let imageurl = ''
    if (imagePath !== null) {
        imageurl = `http://localhost:5000/uploads/dp/${imagePath}`
    } else {
        imageurl = ''
    }
    imagePath = ''
    dbServices.updateDetails(details, imageurl).then((result) => {
        res.status(result.statusCode).json(result)
    })
})

//*** Fetching profile details ***
app.get('/get-profile-details/:id', (req, res) => {
    dbServices.userProfileDetails(req.params.id).then((result) => {
        res.status(result.statusCode).json(result)
    })
})

//*** Upload new posts **** 
const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/posts')
    },
    filename: (req, file, cb) => {
        cb(null, postImagePath = Date.now() + path.extname(file.originalname))
    }
})
const uploadPost = multer({ storage: storage2 })
app.post('/post-image', uploadPost.single('image'), (req, res) => {
    const body = JSON.parse(req.body.details)
    let imageurl = ''
if(postImagePath !== ''){
     imageurl = `http://localhost:5000/uploads/posts/${postImagePath}`
}else{
    imageurl = ''
}
postImagePath = ''
    dbServices.uploadPost(body, imageurl).then((result) => {
        res.status(result.statusCode).json(result)
    })
})

// ***delete post ***
app.post('/delete-post', (req, res) => {
    dbServices.deletePost(req.body).then((result) => {
        res.status(result.statusCode).json(result)
    })
})


//*** feed ***
app.post('/feed', (req, res) => {
    dbServices.getFeed(req.body.id).then((result) => {
        res.status(result.statusCode).json(result)
    })
})

app.post('/post-like',(req,res)=>{
  dbServices.postLike(req.body).then((result)=>{
    res.status(result.statusCode).json(result)
  })
})

app.post('/follow',(req,res)=>{
    dbServices.followRequest(req.body).then((result)=>{
        res.status(result.statusCode).json(result)
    })
})

app.post('/unfollow',(req,res)=>{
    dbServices.unfollowRequest(req.body).then((result)=>{
        res.status(result.statusCode).json(result)
    })
})
// *** prot running ***
const port = process.env.PORT || 5000
server.listen(port, () => {
    console.log(`server started at port ${port}`)

    io.on('connection',(socket)=>{
        console.log('a user connected',socket.id)
        socket.on('send-message',(message)=>{
            console.log('message',message);
            socket.broadcast.emit('receive-message',message)
        })
    })
})