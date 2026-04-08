#!/bin/bash
# Simulate all notification types for a given email
# Usage: ./simulate-notification.sh email@example.com [type]
# type defaults to "all". Other options: birthday, anniversary, inactivity, trivia_tuesday, etc.

EMAIL="${1:-abdumutal@bolderapps.com}"
TYPE="${2:-all}"

curl -X POST "https://nyc.cloud.appwrite.io/v1/functions/695d55bb002bc6b75430/executions" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: 691d4a54003b21bf0136" \
  -H "X-Appwrite-Key: standard_8c9df10a18fc295ba323f5392ea4ce46d0eafd914fc6b20751d44111b15b7cd4906aef20c10778a23b675cb572685bf638d8782be6b7348c2b763723260c1d30b915d80f0b30219b13384c3b72ef821f52bef1fac93c44c853a65d855bca884c073beca6f9d6dc97d8d033e968ca5eb339fe072697549a6336b73119ea37c138" \
  -d "{\"path\": \"/simulate-notification\", \"method\": \"POST\", \"body\": \"{\\\"email\\\": \\\"${EMAIL}\\\", \\\"type\\\": \\\"${TYPE}\\\"}\", \"async\": false}"

echo ""
