import { Router } from "express";
import {
  addSkill,
  countSkills,
  deleteSkill,
  getSkill,
  getSkills,
  updateSkill,
} from "../controllers/skillController.js";
import upload from "../middlewares/multer.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import verifyUser from "../middlewares/verifyUser.js";

const router = Router();

// Read routes (public)
router.get("/", getSkills);
router.get("/:skill_id", getSkill);
router.get("/count/skills", countSkills);

// Write routes (admin and manager only)
router.post(
  "/",
  verifyUser,
  roleMiddleware("admin"),
  upload.single("icon"),
  addSkill
);

router.put(
  "/:skill_id",
  verifyUser,
  roleMiddleware("admin"),
  upload.single("icon"),
  updateSkill
);

router.delete("/:skill_id", verifyUser, roleMiddleware("admin"), deleteSkill);

export default router;
