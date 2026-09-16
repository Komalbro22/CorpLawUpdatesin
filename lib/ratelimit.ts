import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './redis-cache'

export const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: 'ratelimit:feedback',
    })
  : null
