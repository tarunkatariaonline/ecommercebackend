const express = require('express')
var cors = require('cors')
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(cors())
const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})
const router = require('./Router/productRouter')
const router2 = require('./Router/userRouter')




const order = require('./Router/orderRouter')
var cookieParser = require('cookie-parser')
const cloudinary = require('cloudinary').v2;




app.use(cookieParser())






require('./DATABASE/connection');

const port = process.env.PORT;
cloudinary.config({
  cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
  api_key: process.env.CLOUDNARY_API,
  api_secret: process.env.CLOUDNARY_API_SECRET
});


app.use(router)
app.use(router2)
app.use(order)






// Generate 




// The output url


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})