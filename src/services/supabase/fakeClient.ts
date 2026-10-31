import type { SupabaseClient } from '@supabase/supabase-js';

export interface FakeCall {
  table: string;
  ops: { op: string; args: unknown[] }[];
}

type Handler = (call: FakeCall) => { data?: unknown; error?: unknown } | undefined;

/**
 * Test double for the slice of supabase-js the repositories use: every query builder
 * method is recorded and the awaited result comes from `handler`.
 */
export function createFakeClient(handler: Handler) {
  const calls: FakeCall[] = [];
  const client = {
    from(table: string) {
      const call: FakeCall = { table, ops: [] };
      calls.push(call);
      const builder: object = new Proxy(
        {},
        {
          get(_target, prop) {
            if (prop === 'then') {
              return (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) => {
                const r = handler(call) ?? {};
                return Promise.resolve({ data: r.data ?? null, error: r.error ?? null }).then(resolve, reject);
              };
            }
            return (...args: unknown[]) => {
              call.ops.push({ op: String(prop), args });
              return builder;
            };
          },
        },
      );
      return builder;
    },
  };
  return { client: client as unknown as SupabaseClient, calls };
}

export const has = (call: FakeCall, op: string) => call.ops.some((o) => o.op === op);
