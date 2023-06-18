const mongoose = require('mongoose')
const { Schema } = mongoose;


const productSchema = new Schema({
    name:{
        type:String,
        required:[true,"Please Enter Product name"]
    },
    desc:{
        type:String,
        
    },
    price:{
        type:Number,   
        required:[true,"Please Enter Product price"],    
    },
    ratings:{
        type:Number,
        default:0
    },
    image:[
        {
            public_id:{
                type:String,
                // required:true
            },
            url:{
                type:String,
                // required:true
            }
        }
    ],
    category:{
        type:String,
        required:[true,"Please Enter Product Category."]
    },
     Stock:{
        type:Number,
       
        default:1
    },
    numofreview:{
        type:Number,
        default:0
    },
    user:{
        type:String
    },
    
    reviews:[
        {
            user:{
                type:String
            },
            name:{
                type:String,
                
            },
            rating:{
                type:Number,
                
            },
            comment:{
                type:String,
               
            }
        }
    ]
    ,createdAt:{
        type:Date,
        default:Date.now
    }
    
})


const Product = mongoose.model("Product",productSchema);
module.exports = Product;