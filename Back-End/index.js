import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import createUserTable from "./models/userModel.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
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
