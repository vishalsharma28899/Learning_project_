// require("dotenv").config();
// const amqp = require("amqplib");

// // ✅ Import existing configs and models (modular approach)
// const redisClient = require("../config/redis");
// const webpush = require("../config/webpush");
// const Form = require("../models/Form");
// const Subscription = require("../models/Subscription");

// const { RABBIT_URL, QUEUE } = {
//   RABBIT_URL: process.env.RABBIT_URL || "amqp://localhost",
//   QUEUE: "form_data",
// };

// let channel;

 

// // ✅ 2. Message processor logic (business logic only)
// async function processMessage(msg) {
//   try {
//     const data = JSON.parse(msg.content.toString());
//     console.log("📩 Received from queue:", data);

//     // Save form to MongoDB
//     const form = new Form(data);
//     await form.save();
//     console.log("✅ Saved to MongoDB:", form._id);

//     // Clear Redis cache
//     await redisClient.del("forms_cache");
//     console.log("🧹 Redis cache cleared");

//     // Send push notifications
//     const payload = JSON.stringify({
//       title: "New Feedback Received!",
//       body: `${form.name} just submitted feedback.`,
//     });
//     const subs = await Subscription.find();
//     if (subs.length) {
//       await Promise.allSettled(subs.map((s) => webpush.sendNotification(s, payload)));
//       console.log(`📣 Notifications sent to ${subs.length} subscribers`);
//     } else {
//       console.log("ℹ️ No subscribers found");
//     }

//     channel.ack(msg);
//   } catch (err) {
//     console.error("❌ Error processing message:", err.message);
//   }
// }

// // ✅ 3. RabbitMQ Consumer setup (reconnect-safe)
// async function startConsumer() {
//   try {
//     const connection = await amqp.connect(RABBIT_URL);
//     channel = await connection.createChannel();

//     await channel.assertQueue(QUEUE, { durable: true });
//     console.log(`✅ RabbitMQ consumer listening on queue: ${QUEUE}`);

//     channel.consume(QUEUE, processMessage, { noAck: false });

//     connection.on("close", () => {
//       console.error("❌ RabbitMQ connection closed — retrying...");
//       setTimeout(startConsumer, 5000);
//     });
//   } catch (err) {
//     console.error("❌ RabbitMQ consumer error:", err.message);
//     setTimeout(startConsumer, 5000);
//   }
// }

// startConsumer();





/// email setup addone 


const sendEmail = require("../utils/email");

require("dotenv").config();
const amqp = require("amqplib");

// ✅ Import existing configs and models (modular approach)
const redisClient = require("../config/redis");
const webpush = require("../config/webpush");
const Form = require("../models/Form");
const Subscription = require("../models/Subscription");
const connectDB = require("../config/db");
connectDB();
const { RABBIT_URL, QUEUE } = {
  RABBIT_URL: process.env.RABBIT_URL || "amqp://localhost",
  QUEUE: "form_data",
};

let channel;

 async function email(form){

    try{
    //      const adminEmail = "vishal.igtechso@gmail.com";
    // const subject = "New Feedback Submission";
    // const text = `Name: ${form.name}\nEmail: ${form.email}\nMessage: ${form.message}`;
   // await sendEmail(adminEmail, subject, text);

     await sendEmail(
      form.email,
      "Thank you for your feedback!",
      `Hey ${form.name}, thanks for reaching out! We'll contact you soon.`
    );
    }catch (err) {
    console.error("❌ Error:", err.message);
  }

 }

// ✅ 2. Message processor logic (business logic only)
async function processMessage(msg) {
  try {
    const data = JSON.parse(msg.content.toString());
    console.log("📩 Received from queue:", data);

    // Save form to MongoDB
    const form = new Form(data);
    await form.save();
    console.log("✅ Saved to MongoDB:", form._id);

//email
  email(form);
  


    // Clear Redis cache
    await redisClient.del("forms_cache");
    console.log("🧹 Redis cache cleared");

    // Send push notifications
    const payload = JSON.stringify({
      title: "New Feedback Received!",
      body: `${form.name} just submitted feedback.`,
    });
    const subs = await Subscription.find();
    if (subs.length) {
      await Promise.allSettled(subs.map((s) => webpush.sendNotification(s, payload)));
      console.log(`📣 Notifications sent to ${subs.length} subscribers`);
    } else {
      console.log("ℹ️ No subscribers found");
    }

    channel.ack(msg);
  } catch (err) {
    console.error("❌ Error processing message:", err.message);
  }
}

// ✅ 3. RabbitMQ Consumer setup (reconnect-safe)
async function startConsumer() {
  try {
    const connection = await amqp.connect(RABBIT_URL);
    channel = await connection.createChannel();

    await channel.assertQueue(QUEUE, { durable: true });
    console.log(`✅ RabbitMQ consumer listening on queue: ${QUEUE}`);

    channel.consume(QUEUE, processMessage, { noAck: false });

    connection.on("close", () => {
      console.error("❌ RabbitMQ connection closed — retrying...");
      setTimeout(startConsumer, 5000);
    });
  } catch (err) {
    console.error("❌ RabbitMQ consumer error:", err.message);
    setTimeout(startConsumer, 5000);
  }
}

startConsumer();
