#!/usr/bin/env bash
# Create the audiobookshelf library volume, once, outside cdk.
# If a volume with the expected tag already exists in the AZ, print its ID and make no change.

set -euo pipefail

AZ="${ABS_AZ:?set ABS_AZ, e.g. us-east-1a}"
REGION="${ABS_REGION:?set ABS_REGION, e.g. us-east-1}"
SIZE_GIB="${ABS_DATA_VOLUME_GIB:-100}"
NAME_TAG="abs-library-data"
PROFILE="${DEPLOY_ENV:-sandbox}"

# The AZ must be in the region. If they disagree, the lookup and the create
# target different places, and the script makes a duplicate volume every run.
case "$AZ" in
    "$REGION"[a-z]) ;;
    *) echo "ABS_AZ ($AZ) is not in ABS_REGION ($REGION)" >&2; exit 1 ;;
esac

# One region for every call below, so no call can fall back to the profile default.
export AWS_REGION="$REGION" AWS_DEFAULT_REGION="$REGION"

# `creating` is in the status filter on purpose: a volume left behind by an
# interrupted run must be found, not duplicated.
existing=$(aws ec2 describe-volumes \
    --filters "Name=tag:Name,Values=${NAME_TAG}" \
              "Name=availability-zone,Values=${AZ}" \
              "Name=status,Values=creating,available,in-use" \
    --query 'Volumes[].VolumeId' --output text \
    --profile "${PROFILE}") || { echo "describe-volumes failed" >&2; exit 1; }

# Intentional word splitting: --output text gives tab-separated ids, or "" for none.
# shellcheck disable=SC2206
found=($existing)

case "${#found[@]}" in
    0) ;;                              # nothing yet, fall through and create it
    1) echo "${found[0]}"; exit 0 ;;   # already bootstrapped, make no change
    *)
        # Only one of these holds the library data, and this script cannot tell
        # which. Picking wrong serves an empty library, so stop and let a human
        # remove the extras. Diagnostics go to stderr: stdout is a volume id.
        echo "found ${#found[@]} volumes tagged ${NAME_TAG} in ${AZ}: ${found[*]}" >&2
        echo "expected exactly one; delete the extras, then re-run" >&2
        exit 1
        ;;
esac

vol=$(aws ec2 create-volume \
    --availability-zone "${AZ}" \
    --size "${SIZE_GIB}" \
    --volume-type gp3 \
    --encrypted \
    --tag-specifications "ResourceType=volume,Tags=[{Key=Name,Value=${NAME_TAG}},{Key=Project,Value=portfolio-website},{Key=ManagedBy,Value=script}]" \
    --query VolumeId --output text \
    --profile "${PROFILE}") || { echo "create-volume failed" >&2; exit 1; }

# `set -e` does not reach inside an assignment's $(...), so check the value itself.
case "$vol" in
    vol-*) ;;
    *) echo "unexpected volume id from create-volume: [$vol]" >&2; exit 1 ;;
esac

aws ec2 wait volume-available --volume-ids "$vol" --profile "${PROFILE}"
echo "$vol"
