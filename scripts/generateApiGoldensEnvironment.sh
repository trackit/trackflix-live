#!/bin/bash

be_outputs=$(sam list stack-outputs --stack-name="trackflix-live-$STAGE" --output json)
user_pool_id=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="UserPoolId") | .OutputValue')
user_pool_client_id=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="UserPoolClientId") | .OutputValue')
api_endpoint=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="ApiEndpoint") | .OutputValue')
logs_bucket=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="QaLogsBucket") | .OutputValue')
events_table_name=$(echo "$be_outputs" | jq -r -c '.[] | select(.OutputKey=="EventsTableName") | .OutputValue')


{
  echo "USERPOOL_ID=$user_pool_id"
  echo "CLIENT_ID=$user_pool_client_id"
  echo "API_URL=$api_endpoint"
  echo "LOGS_BUCKET=$logs_bucket"
  echo "EVENTS_TABLE_NAME=$events_table_name"
} > apps/api-goldens/.env
