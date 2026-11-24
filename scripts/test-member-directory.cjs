const fs = require('fs'), vm = require('vm'), ts = require('typescript'), assert = require('node:assert/strict');
function load(file, mocks = {}) { const exports = {}; vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports, require: name => { if (!(name in mocks)) throw Error(name); return mocks[name]; }, Date, Map }); return exports; }
const lib = load('src/lib/memberDirectory.ts');
const profile = { id: 'u', full_name: '=HYPERLINK("bad")', email: 'member@example.com' };
const sub = { user_id: 'u', access_level: 'basic', status: 'active', current_period_end: '2027-01-01', created_at: '2026-01-01', cancel_at_period_end: true };
const now = Date.parse('2026-11-24');
let row = lib.memberDirectory([profile], [sub], now)[0];
assert.equal(row.status, 'Activ'); assert.equal(row.renewal, 'Oprită');
row = lib.memberDirectory([profile], [sub, { ...sub, access_level: 'premium', created_at: '2025-01-01' }], now)[0];
assert.equal(row.plan, 'Premium');
row = lib.memberDirectory([profile], [sub, { ...sub, access_level: 'premium', status: 'canceled', created_at: '2026-11-01' }], now)[0];
assert.equal(row.plan, 'Essential');
row = lib.memberDirectory([profile], [sub], Date.parse('2028-01-01'))[0]; assert.equal(row.status, 'Expirat'); assert.equal(row.renewal, '—');
assert.equal(lib.memberDirectory([profile], [], now)[0].status, 'Fără abonament');
const csv = lib.membersCsv(lib.memberDirectory([profile], [sub], now)); assert(csv.includes("\"'=HYPERLINK(\"\"bad\"\")\"")); assert(csv.includes('member@example.com'));
async function access(user, role, panel) {
 let adminReads = 0;
 const route = load('src/app/api/admin/members/route.ts', {
  'next/server': { NextResponse: { json: (data, options) => ({ data, ...options }) } },
  '@/lib/admin': { isAdminUser: r => r === 'admin' },
  '@/lib/adminAccess': { hasAdminPanelAccess: async () => panel },
  '@/lib/supabase/server': { createSupabaseServerClient: async () => ({ auth: { getUser: async () => ({ data: { user } }) }, from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { role } }) }) }) }) }) },
  '@/lib/supabase/admin': { createSupabaseAdminClient: () => { adminReads++; return { from: () => ({ select: () => ({ order: () => ({ range: async () => ({ data: [], error: null }) }) }) }) }; } },
  '@/lib/memberDirectory': lib,
 });
 const result = await route.GET(); return { result, adminReads };
}
(async () => {
 for (const [user, role, panel, status] of [[null, '', false, 401], [{ id: 'u' }, 'member', true, 403], [{ id: 'u' }, 'admin', false, 403]]) {
  const { result, adminReads } = await access(user, role, panel); assert.equal(result.status, status); assert.equal(adminReads, 0); assert.match(result.headers['Cache-Control'], /no-store/);
 }
 const { result, adminReads } = await access({ id: 'u' }, 'admin', true); assert.equal(adminReads, 1); assert.equal(result.data.members.length, 0);
 console.log('PASS: active/canceled/expired memberships, Premium precedence, accounts without subscriptions, CSV escaping/formula protection, unauthenticated/non-admin/locked-admin rejection, authorized access.');
})().catch(e => { console.error(e); process.exitCode = 1; });
