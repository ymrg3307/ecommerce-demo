#!/usr/bin/env bash

set -euo pipefail

REGION="${AWS_REGION:-ap-south-1}"
INVENTORY_TABLE="${DYNAMODB_INVENTORY_TABLE:-ctt-demo-inventory}"

aws dynamodb put-item \
  --region "$REGION" \
  --table-name "$INVENTORY_TABLE" \
  --item '{"productId":{"S":"prod-overshirt-001"},"stockCount":{"N":"12"},"status":{"S":"IN_STOCK"}}'

aws dynamodb put-item \
  --region "$REGION" \
  --table-name "$INVENTORY_TABLE" \
  --item '{"productId":{"S":"prod-dress-002"},"stockCount":{"N":"8"},"status":{"S":"IN_STOCK"}}'

aws dynamodb put-item \
  --region "$REGION" \
  --table-name "$INVENTORY_TABLE" \
  --item '{"productId":{"S":"prod-jacket-003"},"stockCount":{"N":"0"},"status":{"S":"OUT_OF_STOCK"}}'

aws dynamodb put-item \
  --region "$REGION" \
  --table-name "$INVENTORY_TABLE" \
  --item '{"productId":{"S":"prod-kurta-004"},"stockCount":{"N":"5"},"status":{"S":"IN_STOCK"}}'
