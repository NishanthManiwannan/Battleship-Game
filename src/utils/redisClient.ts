import { createClient } from "redis";

const redis = createClient();

redis.on("error", (err) => console.error("Redis Error:", err));

let isConnected = false;

export async function initRedis() {
  if (!isConnected) {
    await redis.connect();
    isConnected = true;
    console.log("✅ Redis connected");
  }
}

export default redis;
