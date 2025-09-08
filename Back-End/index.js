import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import createUserTable from "./models/userModel.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
// CORS: allow Vite dev server by default or override via FRONTEND_URL
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Connect DB once
const db = connectDB();
createUserTable(db);

// Inject db into routes
app.use("/api/auth", authRoutes(db));

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
