#!/bin/bash
set -e

BASE="http://localhost:8080"
WORKDIR="/c/Users/kalej/JobPilot/backend"
cd "$WORKDIR"

# Helper: login and extract session token from cookie jar
login() {
  local email="$1"
  local password="$2"
  local tmpfile="cj_$$.txt"
  curl -s -X POST "$BASE/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\"}" \
    -c "$tmpfile" -b "$tmpfile" > /dev/null
  # Read token from jar
  local token=$(awk -v host="localhost" '$1=="#HttpOnly_"host && $7=="session" {print $8}' "$tmpfile")
  rm -f "$tmpfile"
  echo "$token"
}

# Helper: call /api/auth/me with token
me() {
  local token="$1"
  local tmpfile="cj_me_$$.txt"
  curl -s -b "$tmpfile" "$BASE/api/auth/me" -c "$tmpfile"
  rm -f "$tmpfile"
}

# Helper: call /api/auth/me without cookie
me_no_cookie() {
  curl -s "$BASE/api/auth/me"
}

echo "===== TEST 1: Register success ====="
curl -s -w "\nHTTP:%{http_code}\n" -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"charlie@example.com","password":"securepass123"}'
echo ""

echo "===== TEST 2: Duplicate registration ====="
curl -s -w "\nHTTP:%{http_code}\n" -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"charlie@example.com","password":"anotherpass"}'
echo ""

echo "===== TEST 3: Login ====="
TOKEN=$(login "charlie@example.com" "securepass123")
echo "Token: $TOKEN"
echo "Me response: $(me "$TOKEN")"
echo "HTTP: $(curl -s -o /dev/null -w '%{http_code}' -b cj_me_test.txt -c cj_me_test.txt "$BASE/api/auth/me" 2>/dev/null || echo "$TOKEN" | head -c 0)"
echo ""

echo "===== TEST 4: /api/auth/me (authenticated) ====="
TMPJ="cj_me_$$.txt"
curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"charlie@example.com","password":"securepass123"}' -c "$TMPJ" -b "$TMPJ" > /dev/null
echo "Me response: $(curl -s -b "$TMPJ" "$BASE/api/auth/me")"
echo "HTTP: $(curl -s -o /dev/null -w '%{http_code}' -b "$TMPJ" "$BASE/api/auth/me")"
rm -f "$TMPJ"
echo ""

echo "===== TEST 5: Logout ====="
TMPJ2="cj_log_$$.txt"
curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"charlie@example.com","password":"securepass123"}' -c "$TMPJ2" -b "$TMPJ2" > /dev/null
echo "Logout response: $(curl -s -X POST "$BASE/api/auth/logout" -b "$TMPJ2" -c "$TMPJ2")"
echo "HTTP: $(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/auth/logout" -b "$TMPJ2" -c "$TMPJ2")"
rm -f "$TMPJ2"
echo ""

echo "===== TEST 6: /api/auth/me after logout ====="
TMPJ3="cj_after_$$.txt"
curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"charlie@example.com","password":"securepass123"}' -c "$TMPJ3" -b "$TMPJ3" > /dev/null
curl -s -X POST "$BASE/api/auth/logout" -b "$TMPJ3" -c "$TMPJ3" > /dev/null
echo "Me after logout: $(curl -s -b "$TMPJ3" "$BASE/api/auth/me")"
echo "HTTP: $(curl -s -o /dev/null -w '%{http_code}' -b "$TMPJ3" "$BASE/api/auth/me")"
rm -f "$TMPJ3"
echo ""

echo "===== TEST 7: Bad login credentials ====="
curl -s -w "\nHTTP:%{http_code}\n" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"charlie@example.com","password":"wrongpassword"}'
echo ""

echo "===== TEST 8: Non-existent login ====="
curl -s -w "\nHTTP:%{http_code}\n" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"nobody@example.com","password":"whatever"}'
echo ""

echo "===== TEST 9: /api/auth/me without cookie ====="
echo "Response: $(me_no_cookie)"
echo "HTTP: $(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/auth/me")"
echo ""

echo "===== TEST 10: Logout when already logged out ====="
TMPJ4="cj_already_$$.txt"
curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"charlie@example.com","password":"securepass123"}' -c "$TMPJ4" -b "$TMPJ4" > /dev/null
curl -s -X POST "$BASE/api/auth/logout" -b "$TMPJ4" -c "$TMPJ4" > /dev/null
echo "Second logout response: $(curl -s -X POST "$BASE/api/auth/logout" -b "$TMPJ4" -c "$TMPJ4")"
echo "HTTP: $(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/auth/logout" -b "$TMPJ4" -c "$TMPJ4")"
rm -f "$TMPJ4"
echo ""

echo "===== TEST 11: Email normalization ====="
echo "Register Mixed@Example.COM:"
curl -s -w " HTTP:%{http_code}\n" -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"Mixed@Example.COM","password":"password123"}'
echo ""
echo "Login with lowercase test@example.com:"
TOKEN_NORM=$(login "test@example.com" "password123")
echo "Token: $TOKEN_NORM"
if [ -n "$TOKEN_NORM" ]; then
  echo "Me response: $(curl -s -H "Cookie: session=$TOKEN_NORM" "$BASE/api/auth/me")"
  echo "HTTP: $(curl -s -o /dev/null -w '%{http_code}' -H "Cookie: session=$TOKEN_NORM" "$BASE/api/auth/me")"
else
  echo "ERROR: No token received"
fi
echo ""

echo "===== ALL TESTS COMPLETE ====="
