const User = require('../Schema/userSchema')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const crypto  = require('crypto')
const cloudinary = require('cloudinary').v2


const sendForgotPasswordMail = require('../Utils/nodemailer')
const getDatauri = require('../Utils/dataUri')
//signup api is here............................
const userSignup = async(req,res)=>{
const {name,email,password,cpassword,phoneno} = req.body;



console.log(req.body)
console.log("I am here")
console.log(req.body.name)
if(!name|| !email|| !password || !cpassword|| !phoneno ){
    return res.status(406).json({
        message:"please fill all the details."
    })

    
}


// if(!req.file){
//     return res.status(406).json({
//         message:"Please Upload Your Profile Picture."
//     })
// }


if(password!=cpassword){
  return  res.status(406).json({
        message:"Password is not matching."
    })
}




const user = await User.findOne({email:email});
    if(user){
    return res.status(406).json({
        message:"user already exist."
    })
    }

    const file = req.file;
if(file){
const fileUrl = getDatauri(file);
console.log(fileUrl)

    
    const myCloud = await cloudinary.uploader.upload(fileUrl.content,{folder:'/Avatar'})


    const imageObject = {
        public_id:myCloud.public_id,
        url:myCloud.url
    }
    req.body.avatar = imageObject
}
    console.log(req.body)
await User.create(req.body);

  const userLogin = await User.findOne({email:email});
  const {avatar,_id,isAdmin} = userLogin
  const token = await userLogin.generateAuthToken();

  res.cookie('ecomtoken',token,{
    expires:new Date(Date.now()+25555555555555),
  
secure:true,
sameSite:"none",
     
    })

  res.status(201).json({
    success:"true",
    message:"Sign Up Successfully.",
    name,
    avatar,
    email,
    isAdmin,
    phoneno,
    _id
  })
}

//signin ka usercontroller===================================================
const userSignin = async (req,res)=>{

const {email,password} = req.body;
if(!email || !password){
    return res.status(406).json({
        message:"please fill all the details."
    })
}

const userLogin = await User.findOne({email:email});

if(!userLogin){
    return res.status(406).json({
        message:"Invalid Credentials."
    })

   

}
const isMetch = await bcrypt.compare(password,userLogin.password)
// console.log(isMetch);

if(isMetch){
    const token = await userLogin.generateAuthToken();
res.cookie('ecomtoken',token,{
expires:new Date(Date.now()+2555555555555),
sameSite:"none",
secure:true

})
console.log(token);
console.log(userLogin);

const {name,avatar,email,isAdmin,phoneno,_id} = userLogin
console.log(email)
res.status(200).json({
    success:"true",
    message:"Sign In Successfully.",
    name,
    avatar,
    email,
    isAdmin,
    phoneno,
    _id
})
}else{
   return res.status(406).json({
        message:"Invalid Credentials."
    })
}


}
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//forgotpasswordapi:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
const forgotUserPassword = async (req,res)=>{

    const {email} = req.body;
    if(!email){
        return res.status(406).json({
            error:"Please enter Email Id."
        })
    }

    const user =  await User.findOne({email:email});
    if(!user){
        return res.status(406).json({
            error:"User Not found."
        })
    }

   const resetpassowrdToken = await user.getResetPasswordToken();
   await user.save({validateBeforeSave:false});
   
   const url = `${process.env.FRONTENDURL}/user/forgotpassword/reset/${resetpassowrdToken}`
   const subject = "Forgot Password"
   const message =`your reset password url is : ${url}`;

   try{
   await sendForgotPasswordMail(user.email,message,subject)
   res.status(200).json({
    success:"true",
    message:"reset password email sended to your email."
   })
   }catch(err){
    user.resetPasswordToken=undefined;
   user.resetPasswordTokenExpire=undefined;
   await user.save({validateBeforeSave:false})
    res.status(406).json({
        error:"error found in mail send",
    
    })
   }

    

}
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//forgot password ko update karne ki api:::::::::::::::::::::::::::::::::::::::::::::::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
const forgotupdatepassword =async (req,res)=>{

    const {password,cpassword} = req.body;
    if(!password || !cpassword){
       return res.status(406).json({
            error:"fill all the details."
        })
    }

    if(password!=cpassword){
        return res.json({
            error:"password is not macthing."
        })
    }
const resetPasswordToken= crypto.createHash('sha256').update(req.params.token).digest('hex');

console.log(resetPasswordToken)

const  user  = await User.findOne({resetPasswordToken,resetPasswordTokenExpire:{$gt:Date.now()}})

console.log(user)
if(!user){
    console.log("hello I am in response")
    return res.status(406).json({
        message:"user not found."
    })
}

user.password = password;
user.cpassword = cpassword;
user.resetPasswordToken=undefined;
user.resetPasswordTokenExpire=undefined;
await user.save();

res.status(200).json({
    success:"true",
    message:"password updated successfully."
})
}

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//about me user page api::::::::::::::::::::::::::::::::::
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::

const getUserDetails = async(req,res)=>{

    const user = await User.findOne({email:req.rootUser.email})
 
    const {email,phoneno,name,_id,avatar,isAdmin} = user;
  
    res.status(200).json({
        message:"success",
        email,
        phoneno,
        name,
        _id,
        avatar,
        isAdmin
        
       

    }
    )


}

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//Update password api ::::::::::::::::::::::::::::::::::::::::::::::::::
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
const updatePassword = async(req,res)=>{

    if(!req.body.password || !req.body.cpassword){
      return  res.status(406).json({
            message:"fill password correctly."
        })
    }

const user = await User.findOne({email:req.rootUser.email});

const oldpassword = req.body.oldpassword
if(req.body.password!=req.body.cpassword){
return res.status(406).json({
    message:"your password and confirm password is not matching. "
})


}

if(oldpassword==req.body.password){
  return  res.status(406).json({
        message:"your new password is as same as old password"
    })
}

console.log("I am here")
console.log(user.password)
console.log(oldpassword)
const isMatch = await bcrypt.compare(oldpassword,user.password)
console.log(isMatch)
if(isMatch){

user.password = req.body.password,
user.cpassword = req.body.cpassword;
await user.save({validateBeforeSave:false});
return res.status(200).json({
    message:"password updated successfully.",

})
}else{
  return  res.status(406).json({
        message:"your password not matching."
    })
}
}


//:::::::::::::::::::::::::::::::::::::::::::::::::::::
//Update Profile Api:::::::::::::::::::::::::::::::::::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::
const updateProfile = async (req,res)=>{

    // console.log(req.file)
   console.log("I am in update Profile")
    const user = await User.findOne({email:req.rootUser.email});
     console.log(req.file)
    // console.log(req.body)
    if(req.file){


        const fileUrl = getDatauri(req.file)

        // console.log("fileUrlis", fileUrl)
        
        // if(user.avatar){
        //     const cloudRes =  await cloudinary.uploader.destroy(user?.avatar?.public_id)

        //     console.log(cloudRes)
        // }

        
        const cloudUploadRes = await cloudinary.uploader.upload(fileUrl.content)
        const tempObj = {
            public_id:cloudUploadRes.public_id,
            url:cloudUploadRes.url
        }
          
        req.body.avatar = tempObj
    

    }

 if(req.body.password || req.body.cpassword){
   return res.json({
        error:"fill correct details."
    })
 }   


 const updatedUser = await User.findByIdAndUpdate({_id:user._id},req.body,{
    new:true,
    runValidators:false,
    useFindAndModify:false
})

res.send({
    success:"true",
    updatedUser
})

}


//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//userdata - admin api:::::::::::::::::::::::::::::::::::::::
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
const getAllUsersData = async(req,res)=>{

    const users = await User.find();

    res.json({
        users,
        success:"true"
    })

}


//::::::::::::::::::::::::::::::::::::::::::::
//get single user data - Admin :::::::::::::::::::::::
//::::::::::::::::::::::::::::::::::::::::::::
const getSingleUser = async(req,res)=>{

const user = await User.findById(req.params.id)

if(!user){
    res.json({
        error:"User not found."
    })
}else{

res.json({
    success:"true",
    user
})
}
}


//updateUserRole
const updateUserRole = async(req,res)=>{

    try{
    const _id = req.body.id;
    console.log(_id)
const role = req.body.role;
console.log(role)

if(!_id ){
   return res.status(406).json({
        message:"Enter Id or Role"
    })
}

const user = await User.findById(_id);

if(!user){
   return res.status(406).json({
       message:"User not found."
    })
}else{
user.isAdmin = Number(role);

await user.save();
}
res.status(200).json({
    success:"true",
    message:"Role Updated Successfully.",
    user
})
}catch(err){
    res.json({
       message:"Enter Id or Role."
    })
}
}

//::::::::::::::::::::::::::::::::::::::::::::::::::::::
//delete User - Admin:::::::::::::::::::::::::::::::::::
//::::::::::::::::::::::::::::::::::::::::::::::::::::::
const deleteUser = async(req,res)=>{
    const id = req.params.id
    const user = await User.findById(id)
    const public_id= user.avatar.public_id

    if(!user){
        return res.json({
            message:"User Not Found"
        })
    }
     
    if(public_id){
    const cloudRes =  await cloudinary.uploader.destroy(public_id)
    }
    const deleteUser = await User.findByIdAndDelete(id)
    res.json({
        message:"User Deleted Successfully."
    })
}




const userLogout = (req,res)=>{
    console.log("Hello I am on Logout Page ")
    res.cookie('ecomtoken',null,{
        expires:new Date(Date.now()),
      
    secure:true,
    sameSite:"none",
         
        })
    
   return res.status(200).json({
        message:"Logout Successfully"
    })

}
module.exports = {userSignup,userSignin,forgotUserPassword,forgotupdatepassword,
                   getUserDetails,updatePassword,updateProfile,getAllUsersData,getSingleUser,updateUserRole,deleteUser,userLogout};  

                 