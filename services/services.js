const db = require('./db/db')
const multer = require('multer')

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
                postsCount: 0,
                followersCount: 0,
                followingCount: 0,
                bio: '',
                followers: [],
                following: []
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
    return db.User.findOne({ id }).then((result) => {
        if (result) {
            return {
                statusCode: 200,
                message: 'success',
                user: result
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
    try {
        const result = await db.User.findOne({ id: body.id })
        if (imageurl.includes('.jpg' || '.png' || '.jpeg')) {
            result.profileImage = imageurl
        }
        result.firstName = body.firstname
        result.secondName = body.secondname
        result.email = body.email
        result.location = body.location
        result.bio = body.bio
        result.save()
        return {
            statusCode: 200,
            message: 'Details updated successfully'
        }
    } catch (error) {
        console.log()
        return {
            statusCode: 400,
            message: 'Updation failed'
        }
    }
}
module.exports = {
    userRegistration,
    userLogin,
    getDetails,
    updateDetails
}