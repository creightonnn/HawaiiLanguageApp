#!/usr/bin/env bash
TOKEN="sbp_bd1d168db0bcdd9edfe2d5246f12f3fce693abf3"
REF="ywdljhwwggoewuybhkei"
BASE="C:/Users/creig/source/repos/ConsoleApp2/na-inoa-o-hawaii/supabase/functions"
SCRIPT_DIR="C:/Users/creig/source/repos/ConsoleApp2/na-inoa-o-hawaii/scripts"

deploy() {
  local slug="$1"
  local src_file="$2"

  echo "==> Deploying $slug ..."
  perl "$SCRIPT_DIR/json_encode_func.pl" "$slug" "false" "$src_file" > /tmp/"$slug"_payload.json

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://api.supabase.com/v1/projects/$REF/functions/$slug" \
    -H "Authorization: Bearer $TOKEN")

  if [ "$STATUS" = "200" ]; then
    RESPONSE=$(curl -s -X PATCH "https://api.supabase.com/v1/projects/$REF/functions/$slug" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      --data-binary @/tmp/"$slug"_payload.json)
  else
    RESPONSE=$(curl -s -X POST "https://api.supabase.com/v1/projects/$REF/functions" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      --data-binary @/tmp/"$slug"_payload.json)
  fi

  echo "$RESPONSE"
  echo ""
}

deploy "search"   "$BASE/search/index.ts"
deploy "map-pins" "$BASE/map-pins/index.ts"
deploy "quiz"     "$BASE/quiz/index.ts"
deploy "chat"     "$BASE/chat/index.ts"
