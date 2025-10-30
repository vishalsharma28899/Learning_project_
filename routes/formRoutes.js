// const express = require("express");
// const { channelPromise, QUEUE } = require("../config/rabbitmq");
// const Form = require("../models/Form");
// const redisClient = require("../config/redis");

// const router = express.Router();

// // ✅ POST /api/form → Send message to RabbitMQ
// router.post("/form", async (req, res) => {
//   try {
//     const { name, email, message } = req.body;
//     if (!name || !email || !message)
//       return res.status(400).json({ success: false, error: "All fields are required" });

//     const formData = { name, email, message, createdAt: new Date() };

//     // Wait for channel to be ready
//     const channel = await channelPromise;
//     if (!channel) throw new Error("RabbitMQ channel not ready");

//     await channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(formData)), { persistent: true });
//     console.log("📨 Form pushed to queue:", formData);

//     res.json({ success: true, message: "Form submitted and queued successfully!" });
//   } catch (err) {
//     console.error("❌ Error in /api/form:", err.message);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // ✅ GET /api/forms → Redis + Mongo
// router.get("/forms", async (req, res) => {
//   try {
//     const cacheData = await redisClient.get("forms_cache");
//     if (cacheData) {
//       console.log("⚡ Serving forms from Redis cache");
//       return res.json(JSON.parse(cacheData));
//     }

//     const forms = await Form.find().sort({ createdAt: -1 });
//     await redisClient.setEx("forms_cache", 60, JSON.stringify(forms));
//     console.log("💾 Forms cached in Redis for 60 seconds");
//     res.json(forms);
//   } catch (err) {
//     console.error("❌ Error fetching forms:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;







/// email ke liye system addone 



const express = require("express");
const { channelPromise, QUEUE } = require("../config/rabbitmq");
const Form = require("../models/Form");
const redisClient = require("../config/redis");

const router = express.Router();

// ✅ POST /api/form → Send message to RabbitMQ
router.post("/form", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ success: false, error: "All fields are required" });

    const formData = { name, email, message, createdAt: new Date() };

    // Wait for channel to be ready
    const channel = await channelPromise;
    if (!channel) throw new Error("RabbitMQ channel not ready");

    await channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(formData)), { persistent: true });
    console.log("📨 Form pushed to queue:", formData);

    res.json({ success: true, message: "Form submitted and queued successfully!" });
  } catch (err) {
    console.error("❌ Error in /api/form:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ GET /api/forms → Redis + Mongo
router.get("/forms", async (req, res) => {
  try {
    const cacheData = await redisClient.get("forms_cache");
    if (cacheData) {
      console.log("⚡ Serving forms from Redis cache");
      return res.json(JSON.parse(cacheData));
    }

    const forms = await Form.find().sort({ createdAt: -1 });
    await redisClient.setEx("forms_cache", 60, JSON.stringify(forms));
    console.log("💾 Forms cached in Redis for 60 seconds");
    res.json(forms);
  } catch (err) {
    console.error("❌ Error fetching forms:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

