#!/usr/bin/env bash
# Deploy the Notification functions worker to Appwrite Cloud.
# Docs: https://appwrite.io/docs/tooling/command-line/non-interactive
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

ENDPOINT="${APPWRITE_ENDPOINT:-https://nyc.cloud.appwrite.io/v1}"
PROJECT_ID="${APPWRITE_PROJECT_ID:-691d4a54003b21bf0136}"
FUNC_ID="${APPWRITE_NOTIFICATION_FUNCTION_ID:-695d55bb002bc6b75430}"

if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ROOT/.env"
  set +a
fi

if [[ -n "${APPWRITE_API_KEY:-}" ]]; then
  echo "Configuring CLI with API key (non-interactive)..."
  appwrite client --endpoint "$ENDPOINT" --project-id "$PROJECT_ID" --key "$APPWRITE_API_KEY"
else
  echo "No APPWRITE_API_KEY in environment or $ROOT/.env — using your saved CLI session."
  echo "If push fails with 'Session not found': run  appwrite login"
  echo "Then:  appwrite client --endpoint $ENDPOINT --project-id $PROJECT_ID"
fi

echo "Pushing function $FUNC_ID ..."
appwrite push functions --function-id "$FUNC_ID" --force
echo "Push finished. Check Appwrite Console → Functions → Deployments for build status."
