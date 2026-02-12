/**
 * Redis client for Vercel (Upstash Redis from Marketplace).
 * Uses UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN, or fallback KV_REST_API_URL + KV_REST_API_TOKEN.
 * REST URL must start with https://; if missing or rediss://, kv is null and store uses in-memory.
 */

import { Redis } from '@upstash/redis';

const url =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN;

// @upstash/redis requires the REST API URL (https://...), not the TCP URL (rediss://...)
const hasValidRestUrl = typeof url === 'string' && url.startsWith('https://');

export const kv =
  hasValidRestUrl && token
    ? new Redis({
        url,
        token,
      })
    : null;

export const isKvEnabled = (): boolean => !!kv;
