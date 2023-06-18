

const cloudinary = require('cloudinary').v2
const { findOne, findById } = require('../Schema/productSchema');
//create product::::::::::::::::::::::::::::

const Product = require('../Schema/productSchema');
const getDatauri = require('../Utils/dataUri');
const createProduct = async(req,res)=>{
   
    const file = req.files;

    if(file.length===0){
      return res.status(404).json({
        message:"Please Upload Product Image ."
      })

    }
    

    const imageLinks= []
    
    for(let i =0;i<file.length;i++){
      
        const fileUrl = getDatauri(file[i])
        const myCloud = await cloudinary.uploader.upload(fileUrl.content,{folder:'/product'})
        
        const tempObj = {
            public_id:myCloud.public_id,
            url:myCloud.secure_url
        }

        imageLinks.push(tempObj)
       
    
    }

   req.body.image = imageLinks
    console.log(imageLinks)
    

    req.body.user = req.rootUser._id;
   

  
    const product = await Product.create(req.body);
    console.log(product);
    res.status(201).json({
      success:"true",
      message:"Product Created Successfully.",
      product
    })
}
//api for get all products:::::::::::
const getAllProducts=async (req,res)=>{
    
    const category = req.query.category;
    const sort = req.query.sort;
    const name = req.query.name
    const queryObject ={};
   
    if(name){
      queryObject.name={$regex:name,$options:'i'}

    }
    
    if(category){
       queryObject.category = category
    
    }


   
    let ApiData = Product.find(queryObject);
 
    if(sort){
    const sortFix = sort.replace(","," ");
   ApiData = ApiData.sort(sortFix)
   


    }

    let page = Number(req.query.page) || 1;
    const limit = 1000;
    const skip = (page-1)*limit;

   ApiData= ApiData.skip(skip).limit(limit)
    const products = await ApiData


    
  return  res.json(products);
    res.send(products)
}

//api for get single product 

const getSingleProduct =async (req,res)=>{
   
    try{
    const _id = req.params.id;

    const product = await Product.findById(_id)

  if(!product){
   return res.status(401).json({
    error:"wrong id"
   })
  }
   res.json({
    product
   })

    }catch(err){
        res.status(401).json({
            error:"wrong id try catch"
        })
    }
}


//search product api:::::::

const searchProduct = async(req,res)=>{

    console.log(req.query.search_query)
    const query = req.query.search_query;

    
    const queryObject = {
        name:{$regex:query,$options:'i'}
    }

    const product = await Product.find(queryObject)
    res.json({
        query,
        product
    })


}


//upate Product api:::::::::::::
const updateProduct =async(req,res)=>{
    try{

    req.body.user = req.rootUser._id;
    const product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
        res.json({
            success:"true",
            product
        })
    }catch(err){
        res.status(500).json({
           error:"id is not correct"
        })
    }
}

//delete product:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
const deleteProduct = async(req,res)=>{
    try{
    const product =  await Product.findById(req.params.id);
    console.log(product);

    if(!product){
        return res.status(406).json({
        message:"Product Not Found."
        })
    }
    await Product.findByIdAndDelete(req.params.id)
    res.status(200).json({
        sucess:"true",
        message:"Product Deleted Successfully.",
        product
    })
    }catch(err){
          res.status(406).json({
            message:"for deletion id is not correct."
          })
    }
}

//:::::::::::::::::::::::::::::::::::::::::::::::::::
//create Product Review::::::::::::::::::::::::::::::
//:::::::::::::::::::::::::::::::::::::::::::::::::::
const createProductReview =async (req,res)=>{

    const {rating,comment,productId} = req.body;
const id = req.rootUser._id;
const name = req.rootUser.name;

const review = {
    user:id,
    name,
    rating :Number(rating),
    comment
}
const product = await Product.findById(productId);

if(!product){
    res.status(406).json({
        error:"your product id is not found."
    })
}else{ 
const isReviewed = product.reviews.find((rev)=>rev.user.toString()===id.toString())


if(isReviewed){
    
    isReviewed.rating = rating;
    isReviewed.comment = comment;
//    product.reviews.forEach((rev)=>{
//     if(rev.user.toString()===id.toString()){
//         rev.rating = rating;
//         rev.comment = comment
//     }
//    })
}else{
    product.reviews.push(review);
    product.numofreview = product.reviews.length

}

let avg=0;
product.reviews.forEach((rev)=>avg= avg+rev.rating)

product.ratings =avg/product.reviews.length
 
await product.save({validateBeforeSave:false})
res.status(200).json({
    success:"true",
    message:"Review Submited Succesfully."
})

}


}

//

const getProductReviews = async(req,res)=>{
   const _id = req.query.id

    const product = await Product.findById(_id);
    if(!product){
        return res.json({
            error:"product not found."
        })
    }
    
    res.json({
        success:"true",
        review :product.reviews
    })

}


const deleteReview = async (req,res)=>{
try{

const product = await Product.findById(req.query.productId);


if(!product){
    return res.json({
        error:"product not found."
    })
}

const reviews = product.reviews.filter((rev)=>rev._id.toString()!==req.query.id.toString())

let avg=0;
reviews.forEach((rev)=> avg = avg+rev.rating)
console.log("I am here")
const numOfreviews = reviews.length;
const ratings = avg/numOfreviews;
product.reviews = reviews;
product.ratings = ratings;
product.numofreview= numOfreviews;
await product.save({validateBeforeSave:false})
res.json({
    success:"true",

    
})

}catch(err){

    res.json({
        error:"product not found catch block"
    })

}
}




module.exports = {createProduct,getAllProducts,updateProduct,deleteProduct,createProductReview,getProductReviews,deleteReview,getSingleProduct,searchProduct};