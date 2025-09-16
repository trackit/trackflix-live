#!/bin/bash

be_outputs=$(sam list stack-outputs --stack-name="trackflix-live-$STAGE" --output json)
user_pool_id=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="UserPoolId") | .OutputValue')
user_pool_client_id=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="UserPoolClientId") | .OutputValue')
api_endpoint=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="ApiEndpoint") | .OutputValue')


{
  echo "USERPOOL_ID=$user_pool_id"
  echo "CLIENT_ID=$user_pool_client_id"
  echo "API_URL=$api_endpoint"
} > apps/api-goldens/.env
