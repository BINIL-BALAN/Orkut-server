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
    following:[]
    
})

module.exports={
    User
}