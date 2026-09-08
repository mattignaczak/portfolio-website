#!/usr/bin/env bash
# One-time: push the existing library to the seed/ prefix.
# Resumable — s3 sync compares size + mtime, so an interrupted run continues
# where it stopped. Safe to re-run.
set -euo pipefail

SRC="${1:?usage: abs-seed-library.sh <local-library-dir>}"
BUCKET="${ABS_BACKUP_BUCKET:?set ABS_BACKUP_BUCKET (stack output)}"
PROFILE="${AWS_PROFILE:-prod}"

# Defaults (10 requests, 8 MB chunks) will not saturate 150 Mbps. These persist
# in ~/.aws/config under the named profile — sane for any large transfer.
aws configure set --profile "$PROFILE" s3.max_concurrent_requests 32
aws configure set --profile "$PROFILE" s3.multipart_threshold 64MB
aws configure set --profile "$PROFILE" s3.multipart_chunksize 64MB

args=(
  "$SRC" "s3://${BUCKET}/seed/"
  --storage-class STANDARD
  --exclude '*.DS_Store' --exclude '*Thumbs.db'
  --exclude '*/@eaDir/*' --exclude '*.partial'
)

if [ "${DRY_RUN:-0}" = 1 ]; then
  aws s3 sync "${args[@]}" --dryrun
  exit 0
fi

start=$(date +%s)
aws s3 sync "${args[@]}"
elapsed=$(( $(date +%s) - start ))

# Verify rather than assume. Counts and bytes must match the source.
echo "--- elapsed ${elapsed}s ---"
echo "local:  $(find "$SRC" -type f ! -name '.DS_Store' | wc -l) files, \
$(du -sb "$SRC" | cut -f1) bytes"
aws s3 ls "s3://${BUCKET}/seed/" --recursive --summarize | tail -2
