
import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const client = createClient({
    url: process.env.REDIS_URI,
});

client.on("error", (err) => {
    console.error("Redis Error:", err);
});

async function testRedis() {
    try {
        await client.connect();

        console.log("Redis connected successfully!");

        await client.set("test:key", "Hello Redis");

        const value = await client.get("test:key");

        console.log("Value from Redis:", value);

        await client.del("test:key");

        await client.quit();
    } catch (error) {
        console.error("Connection failed:", error);
    }
}

testRedis();