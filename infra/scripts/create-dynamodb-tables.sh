#!/usr/bin/env bash

set -euo pipefail

REGION="${AWS_REGION:-ap-south-1}"
SESSIONS_TABLE="${DYNAMODB_SESSIONS_TABLE:-ctt-demo-sessions}"
INVENTORY_TABLE="${DYNAMODB_INVENTORY_TABLE:-ctt-demo-inventory}"

aws dynamodb create-table \
  --region "$REGION" \
  --table-name "$SESSIONS_TABLE" \
  --attribute-definitions AttributeName=sessionId,AttributeType=S \
  --key-schema AttributeName=sessionId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST || true

aws dynamodb create-table \
  --region "$REGION" \
  --table-name "$INVENTORY_TABLE" \
  --attribute-definitions AttributeName=productId,AttributeType=S \
  --key-schema AttributeName=productId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST || true
