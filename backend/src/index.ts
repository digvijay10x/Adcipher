import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./config/db";
import routes from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await prisma.$connect();
    res.json({
      status: "ok",
      message: "AdCipher API is running",
      database: "connected",
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Database connection failed" });
  }
});

// Test route to create a demo user
app.get("/api/test/create-user", async (req, res) => {
  try {
    const user = await prisma.user.upsert({
      where: { email: "demo@adcipher.com" },
      update: {},
      create: {
        email: "demo@adcipher.com",
        name: "Demo User",
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
