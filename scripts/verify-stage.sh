#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAGE="${1:-all}"

run_stage_1() {
  python3 "$ROOT/scripts/verify-product-contract.py"
}

run_stage_2() {
  python3 "$ROOT/scripts/verify-brand.py"
}

run_stage_3() {
  python3 "$ROOT/scripts/verify-ux.py"
}

run_stage_4() {
  bash "$ROOT/database/tests/run.sh"
}

case "$STAGE" in
  1|stage1|product|contract) run_stage_1 ;;
  2|stage2|brand) run_stage_2 ;;
  3|stage3|ux) run_stage_3 ;;
  4|stage4|database|db) run_stage_4 ;;
  all)
    run_stage_1
    run_stage_2
    run_stage_3
    run_stage_4
    ;;
  *)
    echo "Usage: $0 {1|2|3|4|all}" >&2
    exit 64
    ;;
esac
