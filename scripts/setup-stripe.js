#!/usr/bin/env node
/**
 * Unimatrix Stripe Setup
 * Creates all products and prices (Pro/Enterprise monthly+yearly).
 * Prints the 4 STRIPE_PRICE_* IDs for you to set via `fly secrets set` (or any platform).
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/setup-stripe.js
 *
 * (The VERCEL_* bits are legacy and optional — if absent it just prints the IDs for manual entry on Fly/Render/etc.)
 */

const https = require('https');
const querystring = require('querystring');

const STRIPE_KEY      = process.env.STRIPE_SECRET_KEY;
const VERCEL_TOKEN    = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT  = process.env.VERCEL_PROJECT_ID  || 'prj_jnbSGZjsPuYBmJyjZh0trtLUKZGB';
const VERCEL_TEAM     = process.env.VERCEL_TEAM_ID     || 'team_pFOPYZcVSfCPAqqbEjHI5BTk';

if (!STRIPE_KEY) { console.error('STRIPE_SECRET_KEY is required'); process.exit(1); }

function stripe(method, path, data) {
  return new Promise((resolve, reject) => {
    const body = data ? querystring.stringify(data) : '';
    const req  = https.request({
      hostname: 'api.stripe.com',
      path: `/v1/${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${STRIPE_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => resolve(JSON.parse(raw)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function vercelEnv(key, value) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ key, value, type: 'encrypted', target: ['production', 'preview'] });
    const req  = https.request({
      hostname: 'api.vercel.com',
      path: `/v10/projects/${VERCEL_PROJECT}/env?teamId=${VERCEL_TEAM}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => resolve(JSON.parse(raw)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('Creating Unimatrix Stripe products and prices...\n');

  // ── Pro product ─────────────────────────────────────────────────────────────
  const pro = await stripe('POST', 'products', {
    name: 'Unimatrix Pro',
    description: 'Unlimited workspaces, unlimited memories, collaborative AI room.',
    metadata: { tier: 'pro' },
  });
  console.log(`Pro product: ${pro.id}`);

  const proMonthly = await stripe('POST', 'prices', {
    product: pro.id,
    unit_amount: 900,
    currency: 'usd',
    recurring_interval: 'month',
    nickname: 'Pro Monthly',
    metadata: { tier: 'pro', interval: 'monthly' },
  });
  console.log(`Pro monthly price: ${proMonthly.id}`);

  const proYearly = await stripe('POST', 'prices', {
    product: pro.id,
    unit_amount: 7900,
    currency: 'usd',
    recurring_interval: 'year',
    nickname: 'Pro Yearly',
    metadata: { tier: 'pro', interval: 'yearly' },
  });
  console.log(`Pro yearly price: ${proYearly.id}`);

  // ── Enterprise product ───────────────────────────────────────────────────────
  const ent = await stripe('POST', 'products', {
    name: 'Unimatrix Enterprise',
    description: 'Self-hosted, agentic device control, team sharing, SSO.',
    metadata: { tier: 'enterprise' },
  });
  console.log(`Enterprise product: ${ent.id}`);

  const entMonthly = await stripe('POST', 'prices', {
    product: ent.id,
    unit_amount: 2900,
    currency: 'usd',
    recurring_interval: 'month',
    nickname: 'Enterprise Monthly',
    metadata: { tier: 'enterprise', interval: 'monthly' },
  });
  console.log(`Enterprise monthly price: ${entMonthly.id}`);

  const entYearly = await stripe('POST', 'prices', {
    product: ent.id,
    unit_amount: 29900,
    currency: 'usd',
    recurring_interval: 'year',
    nickname: 'Enterprise Yearly',
    metadata: { tier: 'enterprise', interval: 'yearly' },
  });
  console.log(`Enterprise yearly price: ${entYearly.id}`);

  const priceIds = {
    STRIPE_PRICE_PRO_MONTHLY:        proMonthly.id,
    STRIPE_PRICE_PRO_YEARLY:         proYearly.id,
    STRIPE_PRICE_ENTERPRISE_MONTHLY: entMonthly.id,
    STRIPE_PRICE_ENTERPRISE_YEARLY:  entYearly.id,
  };

  console.log('\n── Price IDs ──────────────────────────────────────────────────');
  Object.entries(priceIds).forEach(([k, v]) => console.log(`  ${k}=${v}`));

  if (VERCEL_TOKEN) {
    console.log('\nSetting price IDs in Vercel...');
    for (const [key, value] of Object.entries(priceIds)) {
      const r = await vercelEnv(key, value);
      const status = r.created ? 'set' : r.error?.code || JSON.stringify(r).slice(0,80);
      console.log(`  ${key} → ${status}`);
    }
    console.log('\nDone. Redeploy Vercel to pick up the new env vars:');
    console.log('  vercel --prod --force');
  } else {
    console.log('\nNo VERCEL_TOKEN provided. Set the above env vars in Vercel manually');
    console.log('or re-run with VERCEL_TOKEN=xxx to set them automatically.');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
