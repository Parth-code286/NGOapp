import { Router } from "express";
import { getWalletInfo, addFunds, processPayout } from "../controllers/paymentController.js";

const router = Router();

// GET /api/payments/wallet-info
router.get("/wallet-info", getWalletInfo);

// POST /api/payments/add-funds
router.post("/add-funds", addFunds);

// POST /api/payments/payout
router.post("/payout", processPayout);

export default router;
