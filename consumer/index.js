require('dotenv').config();
const { Consumer } = require('sqs-consumer');
const AWS = require('aws-sdk');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

AWS.config.update({
  region: 'ap-northeast-1',
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
});

// const app = Consumer.create({
//   queueUrl: process.env.QUEUE_URL,
//   handleMessage: async (message) => {

//     const { eventId, ticketId, userId, ts } = JSON.parse(message.Body);
//     const connection = await pool.connect();
//     try {
//       await connection.query("BEGIN");
      
//       await connection.query("UPDATE tickets SET amount = amount - 1 WHERE id = 1");
//       await connection.query("INSERT INTO tickets_ownership (ticket_id, user_id, created_at) VALUES ($1, $2, $3)",
//         [ticketId, userId, ts]
//       );
//       await connection.query("INSERT INTO processed_evts (evt_id, ts, result) VALUES($1, $2, $3)", 
//         [eventId, ts, 'SUCCESS']
//       );
      
//       await connection.query("COMMIT");
//     } catch (ex) {
//       await connection.query("ROLLBACK");
//       if (ex.message.match(/processed_evts_pkey/)) return;
//       if (ex.message.match(/ticket_amount_check/)) {
//         try {
//           await pool.query("INSERT INTO processed_evts (evt_id, ts, result) VALUES($1, $2, $3)", 
//           [eventId, ts, 'FAILURE']);
//         } catch (err) {
//           if (!err.message.match(/processed_evts_pkey/)) throw err;
//         }
//         return;
//       };
//       throw new Error("Unexpected Error", ex.message);
//     } finally {
//       await connection.release();
//     }
//   },
//   visibilityTimeout: 30,
//   batchSize: 1,
//   sqs: new AWS.SQS()
// });

const app = Consumer.create({
  queueUrl: process.env.QUEUE_URL,
  handleMessage: async (message) => {
    const { eventId, ticketId, userId, ts } = JSON.parse(message.Body);
    const connection = await pool.connect();
    try {
      await connection.query("BEGIN");
      
      const result = await connection.query("SELECT balance FROM users WHERE id = $1 FOR UPDATE", [userId]);
      console.log(" ============ current balance =========", result.rows[0].balance, new Date());

      // wait 1 second to simulate concurrent access.
      for (let i = 0; i < 350000; i++) {
        for (let j = 0; j < 10000; j++) {}
      }

      const newBalance = result.rows[0].balance + 1;
      await connection.query("UPDATE users SET balance = $1 WHERE id = $2", [newBalance, userId]);
      await connection.query("INSERT INTO processed_evts (evt_id, ts, result) VALUES($1, $2, $3)", 
        [eventId, ts, 'SUCCESS']
      );
      
      await connection.query("COMMIT");
    } catch (ex) {
      await connection.query("ROLLBACK");
      if (ex.message.match(/processed_evts_pkey/)) return;
      throw new Error("Unexpected Error", ex.message);
    } finally {
      await connection.release();
      console.log("finished");
    }
  },
  visibilityTimeout: 30,
  batchSize: 1,
  sqs: new AWS.SQS()
});
 
app.on('error', (err) => {
  console.error("Error: ", err.message);
});
 
app.on('processing_error', (err) => {
  console.error("Processing Error: ", err.message);
});
 

console.log("Consumer Start.");

app.start();