const jwt = require('jsonwebtoken');

const User = require('../Schema/userSchema');

const AdminAuth = async (req,res,next)=>{

    try{
        console.log("I am in middle ware")
     const token = req.cookies.ecomtoken;

     if(!token){
        return res.status(406).json({
            message:"Login Please."
        })
     }
      
    const verifyToken = jwt.verify(token,process.env.SECRET_KEY);
     
  console.log("hello admin")
const rootUser = await User.findById({_id:verifyToken._id});

if(!rootUser){
    return res.status(406).json({
        message:"User not Found"
    })
}
if(rootUser.isAdmin){
req.token = token,
req.rootUser = rootUser,


req.id  = rootUser._id;
   
    next();

}else{
  return  res.status(406).json({
        message:"you are not admin."
    })
}
    }catch(err){
        
   return res.status(406).json({
    err:"Some problem with midleWare"
    })
    }
    }
    
    module.exports = AdminAuth;