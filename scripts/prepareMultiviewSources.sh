#!/bin/bash
# Prepare the MultiView demo source assets.
#
# IMPORTANT: MediaLive cannot decode AV1 video or Opus audio (common in YouTube-sourced MP4s), so
# the source files MUST be H.264 video + AAC audio. This script transcodes the raw demo clips to
# H.264/AAC (720p, capped duration, faststart) and uploads them as the mv-<source>.mp4 keys that
# template.yaml maps each MediaLive channel to. Idempotent: existing targets are skipped unless
# FORCE=1. Requires ffmpeg + the AWS CLI (run under your credentials, e.g. aws-vault exec ...).
#
# Usage: BUCKET=demo-videos-trackflix-live sh scripts/prepareMultiviewSources.sh
set -eu

BUCKET="${BUCKET:-demo-videos-trackflix-live}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# Target key | raw source key in the bucket. Edit to change the demo feeds; keep the target keys in
# sync with the SourceKeys mapping in apps/multiview-demo/template.yaml.
MAP="
mv-soccer.mp4|MBAPPE_FIFA_WORLD_CUP_GOALS.mp4
mv-motorsport.mp4|bigbuckbunny.mp4
mv-basketball.mp4|Kansas City Chiefs vs. Las Vegas Raiders Game Highlights ｜ NFL 2025 Season Week 18 [x4RPMVe9z24].mp4
mv-football.mp4|KANSAS_CITY_CHIEFS_VS_LAS_VEGAS_RAIDERS.mp4
"

echo "$MAP" | while IFS='|' read -r target source; do
  [ -z "$target" ] && continue
  if [ "${FORCE:-0}" != "1" ] && aws s3 ls "s3://${BUCKET}/${target}" >/dev/null 2>&1; then
    echo "skip ${target} (already exists; FORCE=1 to rebuild)"
    continue
  fi
  echo "transcoding ${source} -> ${target}"
  aws s3 cp "s3://${BUCKET}/${source}" "${WORK}/in.mp4" >/dev/null
  ffmpeg -y -i "${WORK}/in.mp4" -t 240 -vf "scale=-2:720" \
    -c:v libx264 -profile:v main -preset veryfast -b:v 3000k -pix_fmt yuv420p \
    -c:a aac -b:a 128k -ac 2 -movflags +faststart "${WORK}/${target}" >/dev/null 2>&1
  aws s3 cp "${WORK}/${target}" "s3://${BUCKET}/${target}" >/dev/null
  echo "uploaded s3://${BUCKET}/${target}"
done

echo "Done."
