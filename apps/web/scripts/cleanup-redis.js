#!/usr/bin/env node
/**
 * Clean up Redis database (Upstash). Deletes all keys in the current database (FLUSHDB).
 * Requires UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN, or KV_REST_API_URL + KV_REST_API_TOKEN.
 *
 * Usage from repo root:  npm run cleanup:redis
 * From apps/web:        npm run cleanup:redis  (loads .env automatically)
 */

const fs = require('fs');
const path = require('path');
const { Redis } = require('@upstash/redis');

// Load .env from apps/web if not already set (Node <20.6 has no --env-file)
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*["']?([^"'\n]*)["']?\s*$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
}
loadEnv();

const url =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  console.error(
    'Missing Redis env. Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_URL + KV_REST_API_TOKEN).'
  );
  process.exit(1);
}

if (!url.startsWith('https://')) {
  console.error('Redis REST URL must start with https:// (use KV_REST_API_URL / UPSTASH_REDIS_REST_URL).');
  process.exit(1);
}

async function main() {
  const redis = new Redis({ url, token });

  try {
    await redis.flushdb();
    console.log('Redis database cleared (FLUSHDB).');
  } catch (err) {
    console.error('Failed to clear Redis:', err.message);
    process.exit(1);
  }
}

main();
