const express = require('express');
const ULID = require('ulid');
const AWS = require('aws-sdk');
AWS.config.update({
  region: 'ap-northeast-1',
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
});
const eventbridge = new AWS.EventBridge({apiVersion: '2015-10-07'});


const app = express();

app.get('/sns', async (req, res) => {
  await publishToSNS();
  res.send('OK');
});

app.get('/event-bridge', async(req, res) => {
  const resp = await putEventToEB
  console.log(resp);
  res.send('OK');  
})

app.listen(3000, () => console.log("start server 3000"));



async function publishToSNS() {
  const params = {
    MessageGroupId: "OrderCreated",
    MessageDeduplicationId: ULID.ulid(),
    Message: JSON.stringify({ event: "OrderCreated", orderId: ULID.ulid(), products: ["dyson", "macbook"]}),
    TopicArn: process.env.TOPIC_ARN
  };
  try {
    const data = await new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();
  } catch (ex) {
    console.log(" publish failed: ", ex.message);
  }
};


async function putEventToEB() {
  const params = {
    Entries: [
      {
        Detail: JSON.stringify({ eventId: ULID.ulid(), message: 'hello world' }),
        DetailType: 'OrderCreated',
        EventBusName: process.env.EVENT_BUS_NAME || "demo-event-bus",
        Resources: [
          'STRING_VALUE',
        ],
        Source: 'STRING_VALUE',
        Time: new Date || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789,
        TraceHeader: 'STRING_VALUE'
      },
    ]
  };
  try {
    return await eventbridge.putEvents(params).promise();
  } catch (ex) {
    return false;
  }
}