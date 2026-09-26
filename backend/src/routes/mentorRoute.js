import { Router } from "express";
import {
  addMentor,
  countMentors,
  deleteMentor,
  getMentor,
  getMentors,
  updateMentor,
} from "../controllers/mentorController.js";
import upload from "../middlewares/multer.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import verifyUser from "../middlewares/verifyUser.js";

const router = Router();

// Read routes (public)
router.get("/", getMentors);
router.get("/:mentor_id", getMentor);
router.get("/count/mentors", countMentors);

// Write routes (admin and manager only)
router.post(
  "/",
  verifyUser,
  roleMiddleware("admin"),
  upload.single("image"),
  addMentor
);

router.put(
  "/:mentor_id",
  verifyUser,
  roleMiddleware("admin"),
  upload.single("image"),
  updateMentor
);

router.delete("/:mentor_id", verifyUser, roleMiddleware("admin"), deleteMentor);

export default router;
