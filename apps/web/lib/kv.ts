/**
 * Redis client for Vercel (Upstash Redis from Marketplace).
 * Uses UPSTASH_REDIS_REST_URL (must start with https://) + UPSTASH_REDIS_REST_TOKEN.
 * If the env has rediss:// (TCP URL) or URL is missing, kv is null and store uses in-memory.
 */

import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

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
