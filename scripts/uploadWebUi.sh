#!/usr/bash

fe_outputs=$(sam list stack-outputs --stack-name="trackflix-live-webui-$STAGE" --output json)
bucket=$(echo "$fe_outputs" | jq -r -c '.[] | select(.OutputKey=="BucketName") | .OutputValue')
distribution_id=$(echo "$fe_outputs" | jq -r -c '.[] | select(.OutputKey=="DistributionId") | .OutputValue')

aws s3 cp --recursive  ./dist/apps/webui "s3://${bucket}/"
aws cloudfront create-invalidation --distribution-id "${distribution_id}" --paths "/*" --no-cli-pager
