import { Router } from "express";
import { login, registerVolunteer, registerNGO } from "../controllers/authController.js";

const router = Router();

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/register/volunteer
router.post("/register/volunteer", registerVolunteer);

// POST /api/auth/register/ngo
router.post("/register/ngo", registerNGO);

export default router;
