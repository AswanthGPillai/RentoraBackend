

exports.registerController=((req,res)=>{
    // logic
    const{un,em,pass}=req.body
    console.log(un,em,pass);
    res.status(200).json("Request received...")
    
})