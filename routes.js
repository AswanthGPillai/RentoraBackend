// import express
const express=require("express")

// import userController
const userController=require("./controllers/usercontroller")

// instance
const route=new express.Router()


route.post("/register",userController.registerController)


module.exports=route
