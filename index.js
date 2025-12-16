// import dotenv

require("dotenv").config()

// import DBfile
require('./dBconnection')


// import express 
const express=require("express")

// import cors
const cors=require("cors")

// import route
const route=require("./routes")

// import middleware
// const appMiddleware=require('./middleware/appMiddleware')



// create server 
const bookStoreServer=express()


// server using cors
bookStoreServer.use(cors())
bookStoreServer.use(express.json())// parse json -- middleware
// bookStoreServer.use(appMiddleware) //--middleware

// exporting upload folder
bookStoreServer.use("/uploads",express.static("./uploads"))
bookStoreServer.use(route)



// create port 
const PORT = process.env.PORT || 4000;

bookStoreServer.listen(PORT,()=>{
    console.log(`Server running in ${PORT}`);
    
})

bookStoreServer.get("/",(req,res)=>{
    res.status(200).send("<h1>Server started......</h1>")
})

