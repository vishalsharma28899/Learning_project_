const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const redis = require("redis");
const app = express();




const PORT = 5000;
const MONGO_URI = "mongodb+srv://vishal:12345@cluster0.hpcdmz5.mongodb.net/?appName=Cluster0";

const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";

//const MONGO_URI = "mongodb://localhost:27017/mydb" ;
app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


  //redis 

  const redisClient = redis.createClient({url: REDIS_URL});
  redisClient.connect()
  .then(()=>console.log("redis conntected"))
  .catch((err)=>console.error("redis error" , err));

// Schema
const formSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const Form = mongoose.model("Form", formSchema);

// Routes
app.get("/", (req, res) => res.send("🚀 Backend running inside Docker!"));

app.post("/api/form", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const form = new Form({ name, email, message });
    await form.save();
      // clear cache after new insert
   const v = await redisClient.del("forms_cache");
   if(v){
    console.log("safcdsaddsadsaa");
   }
    res.status(201).json({ success: true, data: form });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/forms", async (req, res) => {


  try{
    const cacheData = await redisClient.get("forms_cache");
    if(cacheData){
      console.log("catch data");
      return res.json(JSON.parse(cacheData));
    }
  
  const forms = await Form.find().sort({ createdAt: -1 });
  // set cache for 60 seconds
    await redisClient.setEx("forms_cache", 60, JSON.stringify(forms));

  res.json(forms);
  }catch(err){
    res.status(500).json({error : err.message});
  }
});

app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running on port ${PORT}`)
);

