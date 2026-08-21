#!/bin/bash

be_outputs=$(sam list stack-outputs --stack-name="trackflix-live-$STAGE" --output json)
user_pool_id=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="UserPoolId") | .OutputValue')
identity_pool_id=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="IdentityPoolId") | .OutputValue')
user_pool_client_id=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="UserPoolClientId") | .OutputValue')
api_endpoint=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="ApiEndpoint") | .OutputValue')
iot_topic=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="IotTopic") | .OutputValue')

iot_endpoint=$(aws iot describe-endpoint --endpoint-type "iot:Data-ATS" --output json | jq -r -c '.endpointAddress')

# Prefer the region from the environment (CI OIDC and aws-vault both export it) and fall back to the
# active profile's configured region. The previous `aws configure list | awk '{print $2}'` picked up
# the ":" column separator whenever the region came from the environment, writing an invalid region.
aws_region="${AWS_REGION:-${AWS_DEFAULT_REGION:-$(aws configure get region)}}"

# MultiView demo stack outputs (optional: empty when the stack is not deployed, in which case the
# /multiview page falls back to its client-side preview).
mv_outputs=$(aws cloudformation describe-stacks --stack-name "trackflix-multiview-$STAGE" --query "Stacks[0].Outputs" --output json 2>/dev/null || echo '[]')
mv_cf_domain=$(echo "$mv_outputs" | jq -r -c '.[] | select(.OutputKey=="CloudFrontDomain") | .OutputValue')
mv_channel_group=$(echo "$mv_outputs" | jq -r -c '.[] | select(.OutputKey=="ChannelGroupName") | .OutputValue')
mv_endpoint=$(echo "$mv_outputs" | jq -r -c '.[] | select(.OutputKey=="EndpointName") | .OutputValue')

{
  echo "VITE_AWS_REGION=$aws_region"
  echo "VITE_USER_POOL_ID=$user_pool_id"
  echo "VITE_IDENTITY_POOL_ID=$identity_pool_id"
  echo "VITE_APP_CLIENT_ID=$user_pool_client_id"
  echo "VITE_API_URL=$api_endpoint"
  echo "VITE_IOT_DOMAIN_NAME=$iot_endpoint"
  echo "VITE_IOT_TOPIC=$iot_topic"
  echo "VITE_MULTIVIEW_EGRESS_DOMAIN=$mv_cf_domain"
  echo "VITE_MULTIVIEW_CHANNEL_GROUP=$mv_channel_group"
  echo "VITE_MULTIVIEW_ENDPOINT_NAME=$mv_endpoint"
} > apps/webui/.env
