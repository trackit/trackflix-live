# Front-end

## Deploy the web UI
In order to deploy the web UI, you must have valid AWS credentials. This will vary depending on your AWS environment configuration.

Node must be installed: [Install Node](https://nodejs.org/en/download)  
AWS SAM must be installed: [Install the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)  
Jq must be installed: [Jq.org](https://jqlang.org/)

Make sure that you have a .env file at the root of the project as instructed in the back-end [README.md](../api/README.md) and ensure the back-end has been deployed.

Run the following command:
```shell
$ nx run webui:upload
```

This will:
- generate a .env file in the apps/webui folder by fetching the back-end stack output and other parameters
- build the React web application
- deploy a Cloudfront distribution and S3 bucket for hosting
- upload the built React web application to the S3 bucket
