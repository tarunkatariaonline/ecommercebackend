const multer = require('multer')
const storage =multer.memoryStorage()
const multipaleUpload = multer({storage}).array("files",5)
const singleUpload = multer({storage}).single("file")


module.exports = {multipaleUpload,singleUpload};