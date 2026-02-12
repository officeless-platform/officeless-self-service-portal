/**
 * Redis client for Vercel (Upstash Redis from Marketplace).
 * Uses UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
 * When unset (e.g. local dev), store falls back to in-memory.
 */

import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const kv =
  url && token
    ? new Redis({
        url,
        token,
      })
    : null;

export const isKvEnabled = (): boolean => !!kv;
