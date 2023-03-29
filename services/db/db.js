const mongoose = require('mongoose')
require('dotenv').config()
mongoose.connect(process.env.DATABASE_CONNECTION).then(()=>{
    console.log('MongoDB connected successfully');
})

const User = mongoose.model('User',{
    id:String,
    firstName:String,
    secondName:String,
    email:String,
    phone:String,
    password:String,
    profileImage:String,
    location:String,
    postsCount:Number,
    followersCount:Number,
    followingCount:Number,
    bio:String,
    followers:[],
    following:[],
    newMessage:[],
    newRequests:[],
    likedPost: []
})

const Post = mongoose.model('Post',{
    id:String,
    postedImages:[]
})

const Miniprofile = mongoose.model('Miniprofile',{
    id:String,
    profileImage:String,
    firstName:String,
    secondName:String,
    loaction:String,
    online:Boolean
})

const Message = mongoose.model('Message',{
    id:String,
    chats:[]
})
const Connectionkey = mongoose.model('Connectionkey',{
    key:String
})
module.exports={
    User,
    Post,
    Miniprofile,
    Message,
    Connectionkey
}