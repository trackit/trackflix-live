#!/bin/bash
# Start / stop / status of the MultiView demo MediaLive channels for a stage.
# Channels bill only while RUNNING, so start them just for the demo window and stop after.
# Usage: STAGE=demo sh scripts/multiviewChannels.sh {start|stop|status}
# Run under your AWS credentials (e.g. aws-vault exec <profile> -- ...).
set -eu

ACTION="${1:-status}"
STAGE="${STAGE:-demo}"
REGION="${AWS_REGION:-us-west-2}"

# The stack names its channels mv-<source>-<stage>.
IDS=$(aws medialive list-channels --region "$REGION" \
  --query "Channels[?starts_with(Name, 'mv-') && ends_with(Name, '-${STAGE}')].Id" \
  --output text)

if [ -z "$IDS" ]; then
  echo "No MultiView MediaLive channels found for stage '$STAGE' in $REGION."
  exit 0
fi

for id in $IDS; do
  case "$ACTION" in
    start)
      echo "starting $id"
      aws medialive start-channel --channel-id "$id" --region "$REGION" >/dev/null
      ;;
    stop)
      echo "stopping $id"
      aws medialive stop-channel --channel-id "$id" --region "$REGION" >/dev/null
      ;;
    status)
      state=$(aws medialive describe-channel --channel-id "$id" --region "$REGION" --query State --output text)
      name=$(aws medialive describe-channel --channel-id "$id" --region "$REGION" --query Name --output text)
      echo "$id  $name  $state"
      ;;
    *)
      echo "Unknown action '$ACTION' (use start|stop|status)"
      exit 1
      ;;
  esac
done
