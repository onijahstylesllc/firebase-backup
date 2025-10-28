#!/bin/bash
# Security Headers Verification Script
# This script verifies that all security headers are properly configured

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default to localhost
URL="${1:-http://localhost:3000}"

echo "🔒 Verifying Security Headers for: $URL"
echo "=================================================="
echo ""

# Fetch headers
HEADERS=$(curl -sI "$URL" 2>&1)

# Check for required headers
check_header() {
    local header_name="$1"
    local expected_pattern="$2"
    
    if echo "$HEADERS" | grep -qi "^${header_name}:"; then
        local value=$(echo "$HEADERS" | grep -i "^${header_name}:" | head -1 | cut -d: -f2- | xargs)
        
        if [ -n "$expected_pattern" ]; then
            if echo "$value" | grep -qi "$expected_pattern"; then
                echo -e "${GREEN}✓${NC} $header_name: Present and valid"
                return 0
            else
                echo -e "${YELLOW}⚠${NC} $header_name: Present but unexpected value"
                echo "  Value: $value"
                return 1
            fi
        else
            echo -e "${GREEN}✓${NC} $header_name: Present"
            return 0
        fi
    else
        echo -e "${RED}✗${NC} $header_name: Missing"
        return 1
    fi
}

# Check all security headers
FAILURES=0

check_header "Content-Security-Policy" "default-src" || FAILURES=$((FAILURES+1))
check_header "Strict-Transport-Security" "max-age" || FAILURES=$((FAILURES+1))
check_header "X-Content-Type-Options" "nosniff" || FAILURES=$((FAILURES+1))
check_header "X-Frame-Options" "DENY" || FAILURES=$((FAILURES+1))
check_header "Referrer-Policy" "strict-origin-when-cross-origin" || FAILURES=$((FAILURES+1))
check_header "Permissions-Policy" "camera" || FAILURES=$((FAILURES+1))

echo ""
echo "=================================================="

if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}✓ All security headers are properly configured!${NC}"
    exit 0
else
    echo -e "${RED}✗ $FAILURES security header(s) missing or invalid${NC}"
    exit 1
fi
