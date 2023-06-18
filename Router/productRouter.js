const express = require('express')
const {createProduct,getAllProducts, updateProduct, deleteProduct, createProductReview, getProductReviews, deleteReview, getSingleProduct, searchProduct} = require('../Controllers/productController');
const AdminAuth = require('../Middleware/AdminAuth');
const {multipaleUpload}= require('../Middleware/multer');
const userAuth = require('../Middleware/userAuth');


const router = express.Router();

router.post('/api/v1/product/new',multipaleUpload,AdminAuth,createProduct)
router.get('/api/v1/product',getAllProducts);
router.get('/api/v1/product/result',searchProduct)

router.put('/api/v1/product/:id',AdminAuth,updateProduct)


router.post('/api/v1/product/review',userAuth, createProductReview);
router.get('/api/v1/product/review',getProductReviews)
router.delete('/api/v1/product/review/',userAuth,deleteReview)
router.delete('/api/v1/product/:id',userAuth,deleteProduct)
router.get('/api/v1/product/:id',getSingleProduct)
router.get('/api/v1/admin/products',AdminAuth,getAllProducts);
module.exports = router;