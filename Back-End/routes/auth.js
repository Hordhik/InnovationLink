import express from "express";
import { loginUser, signupUser } from "../controllers/authController.js";

// this file just exports a function that takes db and returns a router
const authRoutes = (db) => {
  const router = express.Router();

  router.post("/login", loginUser(db));
  router.post("/signup", signupUser(db));

  return router;
};

export default authRoutes;
