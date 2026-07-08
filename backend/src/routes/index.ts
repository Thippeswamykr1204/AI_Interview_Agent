import { Router } from "express";
import { interviewRoutes } from "./interview.routes";
import { requireApiKey } from "../middleware/auth";

const router = Router();

// Public: no API key required, safe for load balancer / uptime checks.
router.get("/health", (_req, res) => {
  res.status(200).json({ success: true, data: { status: "ok" } });
});

// Everything else requires a valid API key.
router.use("/interview", requireApiKey, interviewRoutes);

export const apiRoutes = router;