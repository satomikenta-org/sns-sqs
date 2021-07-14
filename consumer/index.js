const { Consumer } = require('sqs-consumer');
const AWS = require('aws-sdk');

AWS.config.update({
  region: 'ap-northeast-1',
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
});

const app = Consumer.create({
  queueUrl: process.env.QUEUE_URL,
  handleMessage: async (message) => {
    console.log(" =========== message ========= ", message.Body, counter);
  },
  visibilityTimeout: 20,
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