
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const formRoutes = require("./routes/formRoutes");
const pushRoutes = require("./routes/pushRoutes");

const app = express();
app.use(cors());
app.use(express.json());

const connectDB = require("./config/db");
require("./config/redis");
require("./config/rabbitmq");
require("./config/webpush");

const PORT = process.env.PORT || 5000;


connectDB();

app.use("/api", formRoutes);
app.use("/", pushRoutes);

app.get("/", (req, res) => res.send("🚀 Backend running inside Docker!"));



 app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
