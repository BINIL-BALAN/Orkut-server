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
    return db.User.findOne({ email: body.email, password: body.password }).then((result) => {
        if (result) {
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
            try {
                post = await db.Post.findOne({ id })
            } catch (error) {
                post = { postedImages: [] }
            }
            return {
                statusCode: 200,
                message: 'success',
                user: result,
                post
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
                    data.loaction = body.location
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
                    loaction: body.location
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
        const result = await db.User.findOne({ id })
        try {
            posts = await db.Post.findOne({ id })
            return {
                statusCode: 200,
                details: result,
                posts: posts
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

        return {
            statusCode: 200,
            user,
            post,
            miniProfile,
            userPosts
        }

    } catch (error) {
        return {
            statusCode: 400,
            message: 'No data available'
        }

    }
}

const postLike = async (body) => {
    console.log('body =>',body);

    try {
       const result = await db.User.findOne({ id: body.userId })
        try {
           const posts = await db.Post.findOne({ id: body.postId })
             result.likedPost.push(body.imageUrl)
             let index = posts.postedImages.indexOf(posts.postedImages.find(image => image.imageURL === body.imageUrl))
            //  posts.postedImages[index].likes += 1
             const post = posts.postedImages.splice(index,1)[0]
             post.likes += 1
             posts.postedImages.splice(index,0,post)
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

module.exports = {
    userRegistration,
    userLogin,
    getDetails,
    updateDetails,
    userProfileDetails,
    uploadPost,
    deletePost,
    getFeed,
    postLike
}