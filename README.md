# sns-sqs
sns pub/sub with sqs

** SQS Access Policy (Need to give SNS a permission to sendMessage to SQS)

{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "sns.amazonaws.com"
      },
      "Action": "sqs:SendMessage",
      "Resource": "<SQS_ARN>",
      "Condition": {
        "ArnEquals": {
          "aws:SourceArn": "<SNS_TOPIC_ARN>"
        }
      }
    },
    {
      "Sid": "Stmt1626164315630",
      "Effect": "Allow",
      "Principal": {
        "AWS": "<AWS_USER_ARN>"
      },
      "Action": "SQS:*",
      "Resource": "<SQS_ARN>"
    }
  ]
}
