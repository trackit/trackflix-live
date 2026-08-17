#!/bin/bash
# Prepare the MultiView demo source assets from YouTube.
#
# IMPORTANT: MediaLive cannot decode AV1 video or Opus audio (common in YouTube sources), so the
# source files MUST be H.264 video + AAC audio. This script downloads the first ~10 minutes of each
# clip, transcodes to H.264/AAC (720p, faststart) and uploads them as the mv-<source>.mp4 keys that
# template.yaml maps each MediaLive channel to. Longer clips loop less often (fewer visible restarts).
# Idempotent: existing targets are skipped unless FORCE=1. Requires yt-dlp + ffmpeg + the AWS CLI
# (run under your credentials, e.g. aws-vault exec ...).
#
# Usage: BUCKET=demo-videos-trackflix-live sh scripts/prepareMultiviewSources.sh
set -eu

BUCKET="${BUCKET:-demo-videos-trackflix-live}"
SECONDS_CAP="${SECONDS_CAP:-600}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# Target key | YouTube video id. Edit to change the demo feeds; keep the target keys in sync with the
# SourceKeys mapping in apps/multiview-demo/template.yaml and the catalogue in libs/webui/multiview.
MAP="
mv-f1.mp4|_JeaXt_3Mhc
mv-nascar.mp4|6riXRBU9zuk
mv-football.mp4|Q1ie2-rUHws
mv-tennis.mp4|WfxpIK_TvEQ
mv-cyclisme.mp4|P7E05TTpVr4
"

echo "$MAP" | while IFS='|' read -r target ytid; do
  [ -z "$target" ] && continue
  if [ "${FORCE:-0}" != "1" ] && aws s3 ls "s3://${BUCKET}/${target}" >/dev/null 2>&1; then
    echo "skip ${target} (already exists; FORCE=1 to rebuild)"
    continue
  fi
  echo "downloading ${ytid} -> ${target}"
  yt-dlp -f "bv*[height<=1080]+ba/b" --download-sections "*0-${SECONDS_CAP}" \
    -o "${WORK}/in_${target}.%(ext)s" "https://www.youtube.com/watch?v=${ytid}" >/dev/null 2>&1
  in="$(ls "${WORK}"/in_${target}.* 2>/dev/null | head -1)"
  ffmpeg -y -i "${in}" -t "${SECONDS_CAP}" -vf "scale=-2:720" \
    -c:v libx264 -profile:v main -preset veryfast -b:v 3000k -pix_fmt yuv420p \
    -c:a aac -b:a 128k -ac 2 -movflags +faststart "${WORK}/${target}" >/dev/null 2>&1
  aws s3 cp "${WORK}/${target}" "s3://${BUCKET}/${target}" >/dev/null
  echo "uploaded s3://${BUCKET}/${target}"
done

echo "Done."
