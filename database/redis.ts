import { RedisClientType } from "@redis/client"
import { createClient } from "redis"

let client: RedisClientType

export async function getRedis() {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL })
    await client.connect()
  }
  return client
}