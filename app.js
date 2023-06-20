const express = require('express')
var cors = require('cors')
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
var cookieParser = require('cookie-parser')
app.use(cookieParser())
app.use(cors({
  
  origin:"http://localhost:3000",
  credentials:true,
}))

const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})
const router = require('./Router/productRouter')
const router2 = require('./Router/userRouter')




const order = require('./Router/orderRouter')

const cloudinary = require('cloudinary').v2;











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
  res.send('Hello World! updated')
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})