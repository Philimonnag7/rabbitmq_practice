const express = require("express");
const app = express();
const amqp = require("amqplib/callback_api");
app.get("/user/:id", (req, res) => {
  let id = req.params.id;
  let data = {
    id: id,
    name: "philimon",
    age: 26,
  };
  amqp.connect("amqp://localhost", function (err, conn) {
    conn.createChannel(function (err, ch) {
      const queue = "message_queue_user";
      const msg = JSON.stringify(data);
      ch.assertQueue(queue, { durable: false });
      ch.sendToQueue(queue, Buffer.from(msg));
      console.log(`send ${msg} to ${queue}`);
      res.send(`User servise message:send ${msg} to ${queue}`);
    });
  });
  //   res.send(`User servise message:send ${msg} to ${queue}`);
});

app.listen(8002, () => {
  console.log(`Jesus is with me at:User Service:8002`);
});

// const amqp = require("amqplib/callback_api");
// app.get("/user", (req, res) => {
//   let data = {
//     id: 1,
//     name: "philimon",
//     age: 26,
//   };
//   amqp.connect("amqp://localhost", function (err, conn) {
//     conn.createChannel(function (err, ch) {
//       const queue = "message_queue_user";
//       const msg = JSON.stringify(data);
//       ch.assertQueue(queue, { durable: false });
//       ch.sendToQueue(queue, Buffer.from(msg));
//       console.log(`send ${msg} to ${queue}`);
//     });
//   });
//   res.send("User servise message");
// });
