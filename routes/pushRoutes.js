const express = require("express");
const Subscription = require("../models/Subscription");

const router = express.Router();

router.post("/subscribe", async (req, res) => {
  try {
    const sub = req.body;
    const exists = await Subscription.findOne({ endpoint: sub.endpoint });
    if (!exists) await new Subscription(sub).save();
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/vapidPublicKey", (req, res) => {
  res.send(process.env.VAPID_PUBLIC_KEY);
});

module.exports = router;
