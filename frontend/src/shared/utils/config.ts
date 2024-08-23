const config = {
  Region: process.env.NEXT_PUBLIC_REGION,
  ApiEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT,
  Providers: {
    Cognito: {
      UserPool: {
        Id: process.env.NEXT_PUBLIC_USER_POOL_ID,
        AppClient: {
          Id: process.env.NEXT_PUBLIC_USER_POOL_APP_ID,
          Secret: process.env.NEXT_PUBLIC_COGNITO_SECRET,
        }
      },
      IdentityPool: {
        Id: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID,
      },
      Issuer: `https://cognito-idp.${process.env.NEXT_PUBLIC_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_USER_POOL_ID}`,
    }
  }
};

export default config;
