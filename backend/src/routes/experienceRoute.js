import { Router } from "express";
import {
  addExperience,
  countExperiences,
  deleteExperience,
  getExperience,
  getExperiences,
  updateExperience,
} from "../controllers/experienceController.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import {
  addExperienceValidation,
  updateExperienceValidation,
} from "../middlewares/validation.js";
import verifyUser from "../middlewares/verifyUser.js";

const router = Router();

// Read routes (open access)
router.get("/", getExperiences);
router.get("/:experience_id", getExperience);
router.get("/count/experiences", countExperiences);

// Write routes (restricted to admin and manager)
router.post(
  "/",
  verifyUser,
  roleMiddleware("admin"),
  addExperienceValidation,
  addExperience
);

router.put(
  "/:experience_id",
  verifyUser,
  roleMiddleware("admin"),
  updateExperienceValidation,
  updateExperience
);

router.delete(
  "/:experience_id",
  verifyUser,
  roleMiddleware("admin"),
  deleteExperience
);

export default router;
