import express from "express";
import { googleAuth, signin, signup, logout } from "../controllers/auth.js";

const router = express.Router();

//CREATE A USER
router.post("/signup", signup)

//SIGN IN
router.post("/signin", signin)

//Sign Out
router.post("/logout", logout)

//GOOGLE AUTH
router.post("/google", googleAuth)

export default router;
