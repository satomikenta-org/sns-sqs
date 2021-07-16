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

** above policy will generate automatically, when you subscribe to a SNS topic in SQS console. 


*** Start Postgres 
docker run --rm -d \
    -p 15432:5432 \
    -v postgres-tmp:/var/lib/postgresql/data \
    -e POSTGRES_HOST_AUTH_METHOD=trust \
    postgres:12-alpine