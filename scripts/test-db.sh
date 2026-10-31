#!/usr/bin/env bash
# Applies supabase/migrations to a throwaway local Postgres (twice, to prove they are re-runnable)
# and runs the row-level security tests. Requires Postgres 15+ binaries (initdb, pg_ctl, psql).
set -euo pipefail
cd "$(dirname "$0")/.."

PG_BIN="${PG_BIN:-$(dirname "$(command -v initdb 2>/dev/null || ls -d /usr/lib/postgresql/*/bin/initdb | tail -1)")}"
DATA="$(mktemp -d)"
PORT="${PGPORT_TEST:-54329}"
RUN_AS=()
if [ "$(id -u)" = "0" ]; then
  chown -R postgres "$DATA"
  RUN_AS=(runuser -u postgres --)
fi

cleanup() { "${RUN_AS[@]}" "$PG_BIN/pg_ctl" -D "$DATA" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$DATA"; }
trap cleanup EXIT

"${RUN_AS[@]}" "$PG_BIN/initdb" -D "$DATA" -U postgres -A trust >/dev/null
"${RUN_AS[@]}" "$PG_BIN/pg_ctl" -D "$DATA" -o "-p $PORT -k /tmp -c listen_addresses=''" -w start >/dev/null

PSQL=("${RUN_AS[@]}" psql -h /tmp -p "$PORT" -U postgres -d postgres -v ON_ERROR_STOP=1 -q)
export PGOPTIONS='-c client_min_messages=warning'
"${PSQL[@]}" -f supabase/tests/supabase_stubs.sql
for pass in 1 2; do
  for f in supabase/migrations/*.sql; do "${PSQL[@]}" -f "$f"; done
done
unset PGOPTIONS
echo "✓ migrations applied twice"
"${PSQL[@]}" -f supabase/tests/rls_test.sql 2>&1 | sed -n 's/.*NOTICE:  //p'
echo "✓ row-level security tests passed"
