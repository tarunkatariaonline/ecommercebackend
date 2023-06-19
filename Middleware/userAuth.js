const jwt = require('jsonwebtoken');

const User = require('../Schema/userSchema');

const userAuth= async (req,res,next)=>{
    try{
    const token = req.cookies.ecomtoken;
    console.log(token)
  
      if(!token){
        return res.status(406).json({
            message:"Token Not Found",
            isUser :false,
            token
        })
      }
    const verifyToken = jwt.verify(token,process.env.SECRET_KEY);

    if(!verifyToken){
        return res.status(406).json({
            message:"User Not Varified."
        })
    }
const rootUser = await User.findById({_id:verifyToken._id});

if(!rootUser){
    return res.status(406).json({
      message:"User not found."
    })
}
req.token = token,
req.rootUser = rootUser,
req.id  = rootUser._id;

console.log("I am in user Middle ware")
   
    next();


    }catch(err){
        console.log(err);
   return res.status(406).json({
    err:"Some problem with midleWare"
    })
    }
    }
    
    module.exports = userAuth;