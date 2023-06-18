const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const { Schema } = mongoose;
const crypto = require('crypto')
const userSchema = new Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    cpassword:{
        type:String,
        required:true,
    },
    phoneno:{
       type:String,
       requried:true
    },
    avatar:{
        public_id:{
            type:String,
         
        },
        url:{
            type:String,
           
        }
    },
    isAdmin:{
        type:Boolean,
        default:false

    },
    tokens:[
        {
        token:{
        type:String,
        required:true
        }
        }
        ],
        resetPasswordToken:String,
        resetPasswordTokenExpire :Date
  

})
userSchema.pre('save',async function(next){
    if(this.isModified('password')){
    this.password = await bcrypt.hash(this.password,12);
    this.cpassword = await bcrypt.hash(this.cpassword,12);
    }
    next();
    })

    userSchema.methods.generateAuthToken =async function(){
        try{
        let token = jwt.sign({_id:this._id},process.env.SECRET_KEY)
        this.tokens = this.tokens.concat({token:token})
        await this.save()
        return token;
        }catch(err){
        console.log(err);
        }
        }

        userSchema.methods.getResetPasswordToken = async function(){
          const resetToken = crypto.randomBytes(20).toString('hex');
          this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
          this.resetPasswordTokenExpire = Date.now()+15*60*1000;
          return resetToken;
        }
const User = mongoose.model("User",userSchema);
module.exports = User;