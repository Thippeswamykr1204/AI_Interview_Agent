import { Router } from "express";
import { interviewRoutes } from "./interview.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ success: true, data: { status: "ok" } });
});

router.use("/interview", interviewRoutes);

export const apiRoutes = router;