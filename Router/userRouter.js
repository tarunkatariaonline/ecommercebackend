const express = require('express')
const {userSignup, userSignin,forgotUserPassword,forgotupdatepassword, getUserDetails, updatePassword, updateProfile, getAllUsersData, getSingleUser, updateUserRole, deleteUser, userLogout} = require('../Controllers/userController');
const AdminAuth = require('../Middleware/AdminAuth');
const userAuth = require('../Middleware/userAuth');
const {singleUpload} = require('../Middleware/multer')

const router  = express.Router();
const User = require('../Schema/userSchema',userSignup)

router.post('/api/v1/user/signup',singleUpload,userSignup);
router.post('/api/v1/user/signin',userSignin)
router.get('/api/v1/user/logout',userAuth,userLogout)
router.post('/api/v1/user/forgotpassword',forgotUserPassword)
router.put('/api/v1/user/forgotpassword/reset/:token',forgotupdatepassword)
router.get('/api/v1/user/aboutme',userAuth,getUserDetails);
router.put('/api/v1/user/updatepassword',userAuth,updatePassword)
router.put('/api/v1/user/updateprofile',userAuth,singleUpload,updateProfile)
router.get('/api/v1/admin/users',AdminAuth,getAllUsersData)
router.get('/api/v1/admin/user/:id',AdminAuth,getSingleUser);
router.put('/api/v1/admin/updateuserrole',AdminAuth,updateUserRole);
router.delete('/api/v1/admin/user/:id',AdminAuth,deleteUser);

module.exports = router;