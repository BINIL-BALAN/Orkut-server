const db = require('./db/db')

const userRegistration = (body) => {
    console.log(body);
    return db.User.findOne({email: body.email}).then((result) => {
        if (result) {
            return {
                statusCode: 400,
                message: 'User alerady exist'
            }
        }else{
          const newUser =new db.User({
            id:body.id,
            firstName:body.firstName,
            secondName:body.secondName,
            email:body.email,
            phone:body.phone,
            password:body.password

          })
          newUser.save()
            return {
                statusCode: 200,
                message: 'Account created successfully'
            }
        }
    })
}

const userLogin = (body) => {
    console.log(body);
    return db.User.findOne({ email: body.email , password:body.password }).then((result) => {
        if (result) {
            return {
                statusCode: 200,
                user:result
            }
        }else{
            return {
                statusCode: 400,
                message: 'Invalid credinals'
            }
        }
    })
}

module.exports={
    userRegistration,
    userLogin
}