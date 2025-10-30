const amqp = require("amqplib");
require("dotenv").config();

const QUEUE = "form_data";

async function connectRabbit() {
  try {
    const connection = await amqp.connect(process.env.RABBIT_URL || "amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    console.log("✅ RabbitMQ Connected");

    connection.on("close", () => {
      console.error("❌ RabbitMQ closed. Reconnecting...");
      setTimeout(connectRabbit, 5000);
    });

    return channel; // return the ready channel
  } catch (err) {
    console.error("❌ RabbitMQ Error:", err.message);
    setTimeout(connectRabbit, 5000);
  }
}

// Export a promise that resolves when channel is ready
const channelPromise = connectRabbit();
 
module.exports = { channelPromise, QUEUE };
