# Trackflix live

## Run the project

1. Edit the environment variables in the `.env.example` file and rename it to `.env`.

Variables description:
- `NEXT_PUBLIC_USER_POOL_ID`: ID of the Cognito User pool
- `NEXT_PUBLIC_IDENTITY_POOL_ID`: ID of the Cognito Identity pool
- `NEXT_PUBLIC_AWS_REGION`: AWS region
- `NEXT_PUBLIC_USER_POOL_APP_ID`: ID of the Cognito User pool app
- `NEXT_PUBLIC_COGNITO_SECRET`: Cognito secret
- `NEXTAUTH_SECRET`: NextAuth secret (random string)

```bash
npm install
npm run dev
```
