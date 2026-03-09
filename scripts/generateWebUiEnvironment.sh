#!/bin/bash

# Ensure STAGE is set
if [ -z "$STAGE" ]; then
  STAGE="dev"
fi

# Try to get region from environment or aws configure
aws_region=${AWS_REGION:-$(aws configure get region)}
if [ -z "$aws_region" ]; then
  aws_region="us-east-1"
fi

be_outputs=$(aws cloudformation describe-stacks --stack-name "trackflix-live-$STAGE" --region "$aws_region" --query 'Stacks[0].Outputs' --output json)
if [ $? -ne 0 ]; then
  echo "Failed to get stack outputs for trackflix-live-$STAGE in $aws_region"
  exit 1
fi

user_pool_id=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="UserPoolId") | .OutputValue')
identity_pool_id=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="IdentityPoolId") | .OutputValue')
user_pool_client_id=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="UserPoolClientId") | .OutputValue')
api_endpoint=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="ApiEndpoint") | .OutputValue')
iot_topic=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="IotTopic") | .OutputValue')

iot_endpoint=$(aws iot describe-endpoint --endpoint-type "iot:Data-ATS" --output json | jq -r -c '.endpointAddress')

{
  echo "VITE_AWS_REGION=$aws_region"
  echo "VITE_USER_POOL_ID=$user_pool_id"
  echo "VITE_IDENTITY_POOL_ID=$identity_pool_id"
  echo "VITE_APP_CLIENT_ID=$user_pool_client_id"
  echo "VITE_API_URL=$api_endpoint"
  echo "VITE_IOT_DOMAIN_NAME=$iot_endpoint"
  echo "VITE_IOT_TOPIC=$iot_topic"
} > apps/webui/.env
