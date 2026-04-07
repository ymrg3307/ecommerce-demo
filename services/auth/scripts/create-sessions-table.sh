#!/usr/bin/env bash

set -euo pipefail

TABLE_NAME="${DYNAMODB_TABLE_SESSIONS:-ctt-demo-sessions}"
REGION="${AWS_REGION:-ap-south-1}"

if aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" >/dev/null 2>&1; then
  echo "DynamoDB table '$TABLE_NAME' already exists in region '$REGION'."
  exit 0
fi

aws dynamodb create-table \
  --table-name "$TABLE_NAME" \
  --attribute-definitions AttributeName=sessionId,AttributeType=S \
  --key-schema AttributeName=sessionId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region "$REGION"

echo "Created DynamoDB table '$TABLE_NAME' in region '$REGION'."
