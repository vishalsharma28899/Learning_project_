const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
   
const app = express();




const PORT = 5000;
// cont MONGO_URI = process.env.MONGO_URI || "mongodb://mongodb:27017/mydb";
 
const MONGO_URI = "mongodb://localhost:27017/mydb" ;
app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

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
    res.status(201).json({ success: true, data: form });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/forms", async (req, res) => {
  const forms = await Form.find().sort({ createdAt: -1 });
  res.json(forms);
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
