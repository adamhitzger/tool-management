import { RedisClientType } from "@redis/client"
import { createClient } from "redis"

// Cachujeme rovnou promise, aby paralelní requesty nezaložily víc klientů.
const globalForRedis = globalThis as unknown as {
  redisClient?: Promise<RedisClientType>
}

export function getRedis(): Promise<RedisClientType> {
  if (!globalForRedis.redisClient) {
    const client = createClient({
      url: process.env.REDIS_URL,
    }) as unknown as RedisClientType

    client.on("error", err => console.error("Chyba Redis klienta:", err))

    globalForRedis.redisClient = client.connect().then(() => client)
    globalForRedis.redisClient.catch(() => {
      // Ať se příští volání může připojit znovu.
      globalForRedis.redisClient = undefined
    })
  }

  return globalForRedis.redisClient
}
