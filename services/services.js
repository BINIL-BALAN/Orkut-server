const db = require('./db/db')
const fs = require('fs')

function getPostDate() {
    const date = new Date()
    day = date.getDate()
    m = date.getMonth()
    year = date.getFullYear()
    month = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"]
    return `${month[m]} ${day},${year}`
}
const userRegistration = (body) => {
    return db.User.findOne({ email: body.email }).then((result) => {
        if (result) {
            return {
                statusCode: 400,
                message: 'User alerady exist'
            }
        } else {
            const newUser = new db.User({
                id: body.id,
                firstName: body.firstName,
                secondName: body.secondName,
                email: body.email,
                phone: body.phone,
                password: body.password,
                profileImage: '',
                location: '',
                followersCount: 0,
                followingCount: 0,
                bio: '',
                followers: [],
                following: [],
                newMessage: [],
                newRequests: [],
                likedPost: []
            })
            newUser.save()
            return {
                statusCode: 200,
                id: body.id,
                message: 'Account created successfully'
            }
        }
    })
}

const userLogin = (body) => {
    return db.User.findOne({ email: body.email, password: body.password }).then(async (result) => {
        if (result) {
            try {
                const miniProfile = await db.Miniprofile.findOne({ id: result.id })
                miniProfile.online = true
                miniProfile.save()
            } catch (error) {
                return {
                    statusCode: 200,
                    message: 'success',
                    user: result
                }
            }
            return {
                statusCode: 200,
                message: 'success',
                user: result
            }
        } else {
            return {
                statusCode: 400,
                message: 'Invalid credinals'
            }
        }
    })
}
const getDetails = (id) => {

    return db.User.findOne({ id }).then(async (result) => {
        if (result) {
            let post = {}
            let followers = []
            let following = []
            try {
                post = await db.Post.findOne({ id })
            } catch (error) {
                post = { postedImages: [] }
            }
            try {
                followers = await db.Miniprofile.find({ id: { $in: result.followers } })
            } catch (error) {
                followers = []
            }
            try {
                following = await db.Miniprofile.find({ id: { $in: result.following } })
            } catch (error) {
                following = []
            }
            return {
                statusCode: 200,
                message: 'success',
                user: result,
                post,
                followers,
                following
            }
        } else {
            return {
                statusCode: 400,
                message: 'No data avilable'
            }
        }
    })
}

const updateDetails = async (body, imageurl) => {
    const imgFormats = '.jpg .png .jpeg .jfif .avif'
    try {
        const result = await db.User.findOne({ id: body.id })
        if (imgFormats.includes(imageurl.slice(-4))) {
            result.profileImage = imageurl
        } else {
            result.profileImage = result.profileImage
        }
        result.firstName = body.firstname
        result.secondName = body.secondname
        result.email = body.email
        result.location = body.location
        result.bio = body.bio
        db.Miniprofile.findOne({ id: body.id }).then((data) => {
            if (data) {
                if (imageurl.includes('.jpg' || '.png' || '.jpeg')) {
                    data.profileImage = imageurl
                }
                data.firstName = body.firstname,
                    data.secondName = body.secondname,
                    data.loaction = body.location,
                    data.online = true
                data.save()
            } else {
                let profileImg = ''
                if (imgFormats.includes(imageurl.slice(-4))) {
                    profileImg = imageurl
                }
                const newMiniProfile = new db.Miniprofile({
                    id: body.id,
                    profileImage: profileImg,
                    firstName: body.firstname,
                    secondName: body.secondname,
                    loaction: body.location,
                    online: true
                })
                newMiniProfile.save()
            }
        })

        result.save()
        return {
            statusCode: 200,
            message: 'Details updated successfully'
        }
    } catch (error) {
        return {
            statusCode: 400,
            message: 'Updation failed'
        }
    }
}

const userProfileDetails = async (id) => {
    try {
        let posts = {}
        let followers = []
        let following = []
        const result = await db.User.findOne({ id })
        try {
            posts = await db.Post.findOne({ id })
            try {
                followers = await db.Miniprofile.find({ id: { $in: result.followers } })
            } catch (error) {
                followers = []
            }
            try {
                following = await db.Miniprofile.find({ id: { $in: result.following } })
            } catch (error) {
                following = []
            }
            return {
                statusCode: 200,
                details: result,
                posts: posts,
                followers,
                following
            }
        } catch (error) {
            posts = null
            return {
                statusCode: 200,
                details: result,
                posts: posts
            }
        }

    } catch (error) {
        return {
            statusCode: 400,
            message: 'User not found'
        }
    }
}

const uploadPost = async (body, imageURL) => {
    try {
        const result = await db.Post.findOne({ id: body.id })
        result.postedImages.push({
            id: body.id,
            firstName: body.firstName,
            secondName: body.secondName,
            profileImage: body.profileImage,
            imageURL,
            date: getPostDate(),
            desc: body.desc,
            likes: 0
        })
        result.save()
        return {
            statusCode: 200,
            message: 'Image posted successfully'
        }
    } catch {
        const newPost = new db.Post({
            id: body.id,
            postedImages: [{
                id: body.id,
                firstName: body.firstName,
                secondName: body.secondName,
                profileImage: body.profileImage,
                imageURL,
                date: getPostDate(),
                desc: body.desc,
                likes: 0
            }]
        })
        newPost.save()
        return {
            statusCode: 200,
            message: 'Image posted successfully'
        }
    }
}

const deletePost = async (body) => {
    console.log('display result', body);
    try {
        const result = await db.Post.findOne({ id: body.id })
        try {
            fs.unlinkSync(body.imageUrl.slice(22, body.imageUrl.length))
            const index = result.postedImages.indexOf(result.postedImages.find(post => post.imageURL === body.imageUrl))
            result.postedImages.splice(index, 1)
            result.save()
            return {
                statusCode: 200,
                message: 'Post deleted successfully'
            }
        } catch (error) {
            return {
                statusCode: 400,
                message: "Cant't delete post"
            }
        }
    } catch (error) {
        return {
            statusCode: 400,
            message: " Cant't delete post"
        }
    }
}


const getFeed = async (id) => {
    let post = []
    let miniProfile = []
    let userPosts = []
    let followers = []
    let following = []
    try {
        const user = await db.User.findOne({ id })
        try {
            userPosts = await db.Post.findOne({ id })

        } catch (error) {
            userPosts = []
        }
        try {
            miniProfile = await db.Miniprofile.find({ id: { $ne: id } })
        } catch (error) {
            miniProfile = []
        }

        try {
            const result = await db.Post.find({ id: { $ne: id } })
            const allPost = result.map(item => item.postedImages)
            allPost.map(item => {
                item.forEach(image => {
                    post.push(image)
                });
            })
        } catch (error) {
            post = []
        }

        try {
            followers = await db.Miniprofile.find({ id: { $in: user.followers } })

        } catch (error) {
            followers = []
        }
        try {
            following = await db.Miniprofile.find({ id: { $in: user.following } })
        } catch (error) {
            following = []
        }
        return {
            statusCode: 200,
            user,
            post,
            miniProfile,
            userPosts,
            followers,
            following
        }

    } catch (error) {
        return {
            statusCode: 400,
            message: 'No data available'
        }

    }
}

const postLike = async (body) => {
    try {
        const result = await db.User.findOne({ id: body.userId })
        try {
            const posts = await db.Post.findOne({ id: body.postId })
            result.likedPost.push(body.imageUrl)
            let index = posts.postedImages.indexOf(posts.postedImages.find(image => image.imageURL === body.imageUrl))
            const post = posts.postedImages.splice(index, 1)[0]
            post.likes += 1
            posts.postedImages.splice(index, 0, post)
            posts.save()
            result.save()
            return {
                statusCode: 200
            }
        } catch (error) {
            console.log(error);
            return {
                statusCode: 400,
                messagee: 'Something went wrong 1'
            }
        }

    } catch (error) {
        return {
            statusCode: 400,
            messagee: 'Something went wrong 2'
        }
    }
}

const followRequest = async (body) => {
    try {
        const fromUser = await db.User.findOne({ id: body.fromId })
        try {
            const toUser = await db.User.findOne({ id: body.toId })
            if (!fromUser.following.includes(body.toId) && !toUser.followers.includes(body.fromId)) {
                fromUser.following.push(body.toId)
                toUser.followers.push(body.fromId)
                fromUser.save()
                toUser.save()
            }

            return {
                statusCode: 200,
                message: 'success'
            }
        } catch (error) {
            return {
                statusCode: 400,
                message: 'failed 1'
            }
        }
    } catch (error) {
        return {
            statusCode: 400,
            message: 'failed 2'
        }
    }
}

const unfollowRequest = async (body) => {
    try {
        const fromUser = await db.User.findOne({ id: body.fromId })
        try {
            const toUser = await db.User.findOne({ id: body.toId })
            followingIndex = fromUser.following.indexOf(fromUser.following.find(id => id === body.toId))
            followerIndex = toUser.followers.indexOf(toUser.followers.find(id => id === body.fromId))
            fromUser.following.splice(followingIndex, 1)
            toUser.followers.splice(followerIndex, 1)
            fromUser.save()
            toUser.save()
            return {
                statusCode: 200
            }
        } catch (error) {
            return {
                statusCode: 400,
                message: 'request failed 1'
            }
        }
    } catch (error) {
        return {
            statusCode: 400,
            message: 'request failed 2'
        }
    }
}
const messageService = async (id) => {
    console.log('inside message service')
    try {
        const result = await db.User.findOne({ id })
        let allContact = result.followers.concat(result.following)
        let contactsId = allContact.filter((contact, index) => allContact.indexOf(contact) === index)
        try {
            let allMessages = []
            const contacts = await db.Miniprofile.find({ id: { $in: contactsId } })
            try {
                const userMessages = await db.Message.findOne({ id })
                allMessages = userMessages.chats
            } catch (error) {
                const chats = []
                contacts.forEach(user => {
                    chats.push({
                        id: user.id,
                        messages: []
                    })
                })
                const newMessages = new db.Message({
                    id,
                    chats
                })
                newMessages.save()
            }
            return {
                statusCode: 200,
                contacts,
                allMessages,
                newMessage: result.newMessage
            }
        } catch (error) {
            return {
                statusCode: 400
            }
        }
    } catch (error) {
        return {
            statusCode: 400
        }
    }
}

const savingMessage = async (fromId, toId, message) => {
    console.log('inside save message')
    try {
        const toUser = await db.Message.findOne({ id: toId })
        try {
            const fromUser = await db.Message.findOne({ id: fromId })
            let toIndex = toUser.chats.indexOf(toUser.chats.find(user => user.id === fromId))
            let touser = toUser.chats.splice(toIndex, 1)[0]
            touser.messages.push({
                send: false,
                message
            })
            toUser.chats.splice(toIndex, 0, touser)

            let index = fromUser.chats.indexOf(fromUser.chats.find(user => user.id === toId))
            let user = fromUser.chats.splice(index, 1)[0]
            user.messages.push({
                send: true,
                message
            })
            fromUser.chats.splice(index, 0, user)
            toUser.save()
            fromUser.save()
            return {
                message: {
                    send: false,
                    message
                },
                allMessages: toUser.chats,
                fromId
            }
        } catch (error) {
            return {
                message: 'Cant message to this user'
            }
        }
    } catch (error) {
        return {
            message: 'Cant message to this user'
        }
    }
}

const newMessage = async (fromId, toId, message) => {
    console.log('inside new message')
    try {
        const user = await db.User.findOne({ id: toId })
        // console.log('before',user.newMessage);
        let chat = {}
        if (user.newMessage.includes(chat = user.newMessage.find(user => user.id === fromId))) {
            let index = user.newMessage.indexOf(chat)
            let newMsgs = user.newMessage
            let chatObj = newMsgs.splice(index, 1)[0]
            chatObj.message.push(message)
            newMsgs.splice(index,0,chatObj)
            console.log(newMsgs)
            user.newMessage = newMsgs
        } else {
            const msg = [message]
            user.newMessage.push({
                id: fromId,
                message: msg
            })
        } 
        user.save()  
        return user.newMessage
    } catch (error) {
        console.log('error 1',error);
        return []
    }
}

const clearNewMessageServices = async (id) =>{
    console.log('inside clearNewMessageServices')
    try{
       const result = await clearNewMessage(id)
       return result
    }catch(error){
        console.log('clearNewMessageServices error', error);
        return []
    }
}

const clearNewMessage = async (id) => {
    console.log('inside new clear message')
    let fromId = id.slice(0, 21)
    let toId = id.slice(21, 44)
    try {
        const user = await db.User.findOne({ id: fromId })
        if (user.newMessage.length > 0) {
           if(user.newMessage.includes(user.newMessage.find(user => user.id === toId))){
            let index = user.newMessage.indexOf(user.newMessage.find(user => user.id === toId))
            let newMsg = user.newMessage
            newMsg.splice(index, 1)
            user.newMessage=newMsg
            user.save()
           }
        }
        return user.newMessage
    } catch (error) {
        console.log('clear new message error', error);
        return
    }
}

const deleteAllchats = async (fromId, toId) => {
    console.log('inside delete all mesage')
    try {
        const messageDetails = await db.Message.findOne({ id: fromId })
        if (messageDetails.chats.length > 0) {
            let index = messageDetails.chats.indexOf(messageDetails.chats.find(user => user.id === toId))
            let chats = messageDetails.chats.splice(index, 1)[0]
            chats.messages = []
            messageDetails.chats.splice(index, 0, chats)
            messageDetails.save()
        }
        return {
            statusCode: 200,
            messages: messageDetails.chats
        }
    } catch (error) {
        return {
            statusCode: 400,
            message: 'Chats cant delete'
        }
    }
}

const logout = async (id) => {
    try {
        const result = await db.Miniprofile.findOne({ id })
        result.online = false
        result.save()
        return {
            statusCode: 200
        }
    } catch (error) {
        return {
            statusCode: 400,
            message: 'operation failed'
        }
    }
}
module.exports = {
    userRegistration,
    userLogin,
    getDetails,
    updateDetails,
    userProfileDetails,
    uploadPost,
    deletePost,
    getFeed,
    postLike,
    followRequest,
    unfollowRequest,
    messageService,
    savingMessage,
    deleteAllchats,
    clearNewMessageServices,
    newMessage,
    logout
}

// toUser.chats.find(user=> user.id === fromId).messages.push({
//     send:false,
//     message
// })
// fromUser.chats.find(user=> user.id === toId).messages.push({
//     send:true,
//     message
// })


// console.log('before',user.newMessage);
// let chat = {}
// if (user.newMessage.includes(chat = user.newMessage.find(user => user.id === fromId))) {
//     let index = user.newMessage.indexOf(chat)
//     let newMsgs = user.newMessage
//     let chatObj = newMsgs.splice(index, 1)[0]
//     chatObj.message.push(message)
//     newMsgs.splice(index,0,chatObj)
//     console.log(newMsgs)
//     user.newMessage = newMsgs
// } else {
//     const msg = [message]
//     user.newMessage.push({
//         id: fromId,
//         message: msg
//     })
// } 
// // user.save()  