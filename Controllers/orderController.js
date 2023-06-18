const Order = require('../Schema/orderSchema')
const Product = require('../Schema/productSchema')
const Razorpay = require('razorpay');
var crypto = require("crypto");

const instance = new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_SECRET_KEY ,
  });
const razorPayOrder = async(req,res)=>{
    const amount = req.body.amount
    var options = {
        amount: Number(amount*100),  // amount in the smallest currency unit
        currency: "INR",
      
      };

   const order = await  instance.orders.create(options);

   res.status(200).json({
    order,
    message:"Order Created Successfully.",
    status:true
})

}

const getRazorPayKey = async(req,res)=>{
res.json({
    key:process.env.RAZORPAY_KEY_ID
})

}


const paymentVarificationRazorPay = async(req,res)=>{
console.log(req.body);
 let body=req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;


  var expectedSignature = crypto.createHmac('sha256',process.env.RAZORPAY_SECRET_KEY)
                                  .update(body.toString())
                                  .digest('hex');
                                  console.log("sig received " ,req.body.response.razorpay_signature);
                                  console.log("sig generated " ,expectedSignature);
  
            if(req.body.response.razorpay_signature===expectedSignature){
              return   res.status(200).json({
                    success:true
                }) 


            }
            res.status(206).json({
                success:false
            }) 

}
const newOrder = async(req,res)=>{

    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      } = req.body;

    //   console.log(req.body.paymentInfo)

    //   console.log(req.body.taxPrice)

      const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.rootUser._id,


      });
res.status(201).json({
    success: true,
    message:"Product Ordered Successfully.",
    order,
  });
}

const getSingleOrder = async (req,res)=>{

const order = await Order.findById(req.params.id).populate("user","name email")

if(!order){
    return res.json({
        error:"order not found"
    })
}

res.json({
    success:true,
    order
})
}

 
const myOrders = async (req,res)=>{

    const order = await Order.find({user:req.rootUser._id})

    res.status(200).json({
        success:true,
        order
    })
}


const getAllOrders =async(req,res)=>{

    let total=0;
    const orders = await Order.find();
   
    orders.forEach((order)=>total=total+order.totalPrice)
    res.json({
        orders,
        success:true,
        total
    })
    
}



const updateOrder = async(req,res)=>{
    console.log(req.params.id)
    const {id} = req.params
    console.log(id)

    const order = await Order.findById(id);
    if(!order){
        res.status(406).json({
          message:"Order not found"
        })
    }


    console.log("hello I am here")
    if(order.orderStatus=="Delivered"){
       return res.json({
            Message:"you have already delevierd product."
        })
    }

    if(req.body.status==="Shipped"){
    order.orderItems.forEach(async(order)=>{
        await updateStock(order._id,order.quantity,res)
    })
}
    order.orderStatus = req.body.status;
    
    if(req.body.status==="Delivered"){
        order.deliveredAt=Date.now()

    }

    await order.save({validateBeforeSave:false})
    res.json({
        order,
        message:"Order Deliverd Successfully.",
        success:true
    })
}



async function updateStock (id,quantity,res){
    const product = await Product.findById(id);

    console
    product.Stock-=quantity;
   
    await product.save({validateBeforeSave:false})
    
}


const deleteOrder = async (req,res)=>{
    const order = await Order.findOne(req.params.id);

    if(!order){
        return res.json({
            error:"product not found."
        })
    }
    await order.remove();
    res.json({
        success:"order deleted successfully."
    })

}
module.exports = {razorPayOrder,newOrder,getSingleOrder,myOrders,getAllOrders,updateOrder,deleteOrder,getRazorPayKey,paymentVarificationRazorPay}