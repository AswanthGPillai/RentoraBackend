// import express
const express=require("express")

// import userController
const userController=require("./controllers/usercontroller")
const bookController=require("./controllers/bookController")

// import middleware
const jwtMiddleware=require('./middleware/jwtMiddleware')
const multerConfig = require("./middleware/multerMiddleware")

// instance
const route=new express.Router()


route.post("/register",userController.registerController)

route.post("/login",userController.loginController)

route.post("/google-login",userController.googleLoginController)

route.get("/home-books",bookController.getHomeBookController)



// .........user.............

route.post("/add-book",jwtMiddleware,multerConfig.array("uploadImg",3),bookController.addBookController)

route.get("/all-books",jwtMiddleware,bookController.getAllBooks)

route.get("/view-book/:id",bookController.getABook)



module.exports=route
