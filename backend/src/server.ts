process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { env } from "./config/env";
import prisma from "./config/database";

async function startServer() {
  try {
    await prisma.$connect();

    console.log("✅ Database Connected");
    console.log(
      "🤖 Gemini Key Loaded:",
      !!process.env.GEMINI_API_KEY
    );

    const port = Number(env.PORT);

    app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Database Connection Failed");
    console.error(error);
  }
}

startServer();