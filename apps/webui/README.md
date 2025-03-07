# Front-end

![Trackflix Live Status view](../../assets/trackflix-live.png)

## Quick tour

This project uses:

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Nx](https://nx.dev/)

## Environment variables

The following environment variables are required for the web UI to function properly:

- `VITE_AWS_REGION`: The AWS region where your resources are deployed (e.g., us-east-1)
- `VITE_USER_POOL_ID`: The ID of the Cognito User Pool used for authentication
- `VITE_IDENTITY_POOL_ID`: The ID of the Cognito Identity Pool used for AWS credentials
- `VITE_APP_CLIENT_ID`: The API Gateway App client Id
- `VITE_API_URL`: The URL of the API Gateway endpoint
- `VITE_IOT_DOMAIN_NAME`: The domain name of the IoT Core endpoint
- `VITE_IOT_TOPIC`: The IoT topic name, which matches the environment stage name

These variables are automatically generated during deployment using the backend stack outputs if you follow the process below.

## Run the development server

With a valid environment run:

```shell
$ npm run start -- webui
```

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

## Manually build the WebUI

To manually build the WebUI without deploying:

```shell
$ npm run build -- webui
```

This will generate the static assets in the `dist/webui` folder. You can then serve these files locally or deploy them to your preferred hosting service.
