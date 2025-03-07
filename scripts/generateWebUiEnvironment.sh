#!/bin/bash

be_outputs=$(sam list stack-outputs --stack-name="trackflix-live-$STAGE" --output json)
user_pool_id=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="UserPoolId") | .OutputValue')
identity_pool_id=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="IdentityPoolId") | .OutputValue')
user_pool_client_id=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="UserPoolClientId") | .OutputValue')
api_endpoint=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="ApiEndpoint") | .OutputValue')
iot_topic=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="IotTopic") | .OutputValue')

iot_endpoint=$(aws iot describe-endpoint --endpoint-type "iot:Data-ATS" --output json | jq -r -c '.endpointAddress')

aws_region=$(aws configure list | grep region | awk '{print $2}')

{
  echo "VITE_AWS_REGION=$aws_region"
  echo "VITE_USER_POOL_ID=$user_pool_id"
  echo "VITE_IDENTITY_POOL_ID=$identity_pool_id"
  echo "VITE_APP_CLIENT_ID=$user_pool_client_id"
  echo "VITE_API_URL=$api_endpoint"
  echo "VITE_IOT_DOMAIN_NAME=$iot_endpoint"
  echo "VITE_IOT_TOPIC=$iot_topic"
} > apps/webui/.env
