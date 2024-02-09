//imitializing all the dependencies

//to run the express server
const port =4000;

//using this express we can create app instance of express
const express=require("express");

//creating the instance of the app
const app=express();

//initializing mongoose package
const mongoose=require("mongoose")

//initializing json web token
const jwt=require("jsonwebtoken");

const multer=require ("multer");

//using this path we can get access to backend directory in our express app
const path=require("path");

const cors=require("cors");
// const { error } = require("console");

//whatever request we get from response, that will be automatically pass through json
app.use(express.json());
 
//using this cors, it will connect the react app to express through the port 4000
app.use(cors());

//Database connection with mongoDB
mongoose.connect("mongodb+srv://sheharalsa:sheharalsa@cluster0.33wuers.mongodb.net/e-commerce")

//API Creation

app.get("/",(req,res)=>{
    res.send("Express app is running. ")
})

//Image Storage engine

const storage=multer.diskStorage({
    destination: './upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload=multer({storage:storage})


//creating  upload endpoint for images

app.use('/images',express.static('upload/images'))

app.post("/upload",upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

//Schema for creating products using mongoose library
const Product=mongoose.model("Product",{
    id:{
        type:Number,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true,
    }
});
app.post('/addproduct',async (req,res)=>{

    let products=await Product.find({});
    let id;
    if(products.length>0){
        let last_product_array=products.slice(-1);
        let last_product=last_product_array[0];
        id =last_product.id+1;
    }
    else{
        id=1;
    }
    const product= new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
    });
    console.log(product);
    //using await as to save in the database it'll take some time.
    await product.save();
    console.log("saved");

    //to generate the response for the frontend
    res.json({
        success:true,
        name:req.body.name,
    })

})

//creating API for deleteing products
app.post('/removeproduct',async(req,res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("removed");
    res.json({
        success:true,
        name:req.body.name
    })
})

//Creating API for getting all products
app.get('/allproducts',async (req,res)=>{
    let products=await Product.find({});
    console.log("All products fetched");
    res.send(products);
})

//Schema creating for User model
const Users=mongoose.model('Users',{
    name:{
        type:String
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

//Creating End points for registering users
app.post('/signup',async (req,res)=>{
    let check=await Users.findOne({email:req.body.email});

    if(check){
        return res.status(400).json({success:false,errors:"Existing user found with same email address"})
    }
    //if there is no error
    let cart={};
    for(let i=0; i<300; i++){
        cart[i]=0;
    }
    const user=new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })
    await user.save();

    //jwt authentication

    const data={
        user:{
            id:user.id
        }
    }
//data encripting by one layer.our token is not readable
    const token=jwt.sign(data,'secret_ecom');
    res.json({success:true,token})
})

app.listen(port,(error)=>{
    if( !error){
        console.log("Server running on port "+port);
    }
    else{
        console.log("error !");
    }
})