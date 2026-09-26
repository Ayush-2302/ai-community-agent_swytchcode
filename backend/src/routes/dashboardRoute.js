import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import verifyUser from "../middlewares/verifyUser.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = Router();

router.get("/stats", verifyUser, roleMiddleware("admin"), getDashboardStats);

export default router;
