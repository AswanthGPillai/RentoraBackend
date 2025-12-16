
// import users
const users = require("../models/userModal")

// import jwt 
const jwt = require('jsonwebtoken')


exports.registerController = async (req, res) => {
    // logic
    const { username, email, password } = req.body
    console.log(username, email, password);

    // errr handling
    try {

        const existingUser = await users.findOne({ email })
        if (existingUser) {
            res.status(400).json("Already registered user..")
        } else {
            const newUser = new users({
                username, email, password,profile:""
            })
            await newUser.save() //save to mongodb
            res.status(200).json(newUser)
        }

    } catch (err) {
        res.status(500).json(err)

    }
}

exports.loginController = async (req, res) => {
    // logic
    const { email, password } = req.body
    console.log(email, password);

    // errr handling
    try {

        const existingUser = await users.findOne({ email })
        if (existingUser) {
            if (existingUser.password == password) {
                // JWT encryption 
                const token = jwt.sign({ userMail: existingUser.email }, "secretKey")
                res.status(200).json({ existingUser, token })
            } else {
                res.status(400).json("Password does not match")

            }
        } else {
            res.status(400).json("User does not exist")
        }

    } catch (err) {
        res.status(500).json(err)

    }



}

exports.googleLoginController = async (req, res) => {
    // logic
    const { username, email, password, photo } = req.body
    console.log(username, email, password, photo);

    // errr handling
    try {

        const existingUser = await users.findOne({ email })
        if (existingUser) {
            const token = jwt.sign({ userMail: existingUser.email }, "secretKey")
            res.status(200).json({ existingUser, token })
        } else {
            const newUser = new users({
                username, email, password, profile: photo
            })
            await newUser.save() //save to mongodb
            const token = jwt.sign({ userMail: existingUser.email }, "secretKey")
            res.status(200).json({ existingUser: newUser, token })
        }

    } catch (err) {
        res.status(500).json(err)

    }



}

exports.getAllUsersController = async (req, res) => {
    // logic
    const email = req.payload

    // errr handling
    try {

        const allUsers = await users.find({ email: { $ne: email } })
        res.status(200).json(allUsers)


    } catch (err) {
        res.status(500).json(err)

    }



}

exports.adminUpdateProfileController = async (req, res) => {
    // logic

    const{username,password,profile}=req.body

    const prof=req.file?req.file.filename:profile
    // console.log(req.file.filename);
    

    const email = req.payload
    console.log(email);
    

    // errr handling
    try {

        const adminProfile = await users.findOneAndUpdate({email},{username,email,password,profile:prof},{new:true})
        res.status(200).json(adminProfile)


    } catch (err) {
        res.status(500).json(err)

    }



}


exports.userUpdateProfileController = async (req, res) => {
    // logic
    const{username,password,profile,bio}=req.body
    const prof=req.file?req.file.filename:profile
    // console.log(req.file.filename);
    const email = req.payload
    console.log(email);

    // errr handling
    try {

        const userDetails = await users.findOneAndUpdate({email},{username,email,password,profile:prof,bio},{new:true})
        res.status(200).json(userDetails)
    } catch (err) {
        res.status(500).json(err)

    }
}