const express = require('express');
const { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrder, deleteOrder,razorPayOrder,getRazorPayKey,paymentVarificationRazorPay} = require('../Controllers/orderController');
const AdminAuth = require('../Middleware/AdminAuth');
const userAuth = require('../Middleware/userAuth');
const router = express.Router()

router.post('/api/v1/order/new',userAuth,newOrder)
router.post('/api/v1/razorpay/order',razorPayOrder)//razorpay order create api
router.get('/api/v1/razorpay/key',getRazorPayKey)//razorpay key
router.post('/api/v1/razorpay/paymentvarification',paymentVarificationRazorPay)
router.get('/api/v1/order/me',userAuth,myOrders)
router.get('/api/v1/admin/order/all',AdminAuth,getAllOrders)
router.put('/api/v1/admin/order/:id',AdminAuth,updateOrder)//ye bach rahi hai
router.get('/api/v1/admin/order/:id',AdminAuth,getSingleOrder)
router.get('/api/v1/myorders/:id',userAuth,getSingleOrder)
router.delete('/api/v1/admin/order/:id',AdminAuth,deleteOrder)//or ye bhi bach rahi hai



module.exports = router;