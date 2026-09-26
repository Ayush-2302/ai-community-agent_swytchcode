import { Router } from "express";
import upload from "../middlewares/multer.js";
import {
  addProject,
  countProjects,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
} from "../controllers/projectController.js";
import verifyUser from "../middlewares/verifyUser.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = Router();

// Read routes (public)
router.get("/", getProjects);
router.get("/:project_id", getProject);
router.get("/count/projects", countProjects);

// Write routes (admin and manager only)
router.post(
  "/",
  verifyUser,
  roleMiddleware("admin"),
  upload.single("image"),
  addProject
);

router.put(
  "/:project_id",
  verifyUser,
  roleMiddleware("admin"),
  upload.single("image"),
  updateProject
);

router.delete(
  "/:project_id",
  verifyUser,
  roleMiddleware("admin"),
  deleteProject
);

export default router;
