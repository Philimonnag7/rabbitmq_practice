const express = require("express");
const app = express();
const amqp = require("amqplib");
const queue = "message_queue_user";

const messages = []; // Array to store the received messages with deliveryTag
let channel;
async function connRabbiMq() {
  const connection = await amqp.connect("amqp://localhost");
  channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: false });
  channel.consume(
    queue,
    (msg) => {
      if (msg !== null) {
        messages.push(msg);
      }
    },
    { noAck: false }
  );
}

connRabbiMq();

app.get("/product", (req, res) => {
  const msg = messages.map((e) => JSON.parse(e.content.toString()));
  res.json({ msg });
});
app.get("/product/:id", async (req, res) => {
  const id = req.params.id;
  const msg = messages.map((e, i) => {
    if (JSON.parse(e.content.toString()).id == id) {
      console.log(JSON.parse(e.content.toString()).id);
      messages.splice(e, i);
      return { e, i };
    }
  });
  if (msg[0]) {
    console.log("ack", JSON.parse(msg[0].e.content.toString()));
    channel.ack(msg[0].e);
  }
  let after_dlt = messages.map((e) => JSON.parse(e.content.toString()));
  res.json({ messages: after_dlt });
});
// app.get("/product", (req, res) => {
//   // Array to collect messages from the queue

//   amqp.connect("amqp://localhost", function (err, conn) {
//     conn.createChannel(function (err, ch) {
//       const queue = "message_queue_user";
//       ch.assertQueue(queue, { durable: false }); // Use non-durable queues

//       console.log("Waiting for messages from the queue");
//       const messages = [];
//       ch.consume(
//         queue,
//         function (msg) {
//           if (msg !== null) {
//             const message = JSON.parse(msg.content.toString());
//             console.log("Received message:", message);
//             messages.push(message);
//             console.log("Messages", messages);
//             ch.ack(msg, true);
//             // if (messages.length > messages.length && messages.length != 0) {
//             //   conn.close();
//             //   console.log("All messages processed. Sending response...");
//             //   res.json(messages);
//             // }
//           } else {
//             console.log("All messages processed. Sending response...");
//             conn.close();
//             res.json(messages);
//           }
//         },
//         { noAck: false }
//       );
//     });
//   });
// });
app.listen(8001, () => console.log(`Jesus is with me at:Product Service:8001`));
