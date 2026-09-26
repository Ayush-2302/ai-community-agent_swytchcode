import { Router } from "express";
import {
  addComment,
  countComments,
  deleteComment,
  getComment,
  getComments,
  updateComment,
} from "../controllers/commentController.js";
import verifyUser from "../middlewares/verifyUser.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = Router();

// Read-only routes (public or add verifyUser if needed)
router.get("/", getComments);
router.get("/:comment_id", getComment);
router.get("/count/comments", countComments);

// Write routes (restricted to admin and manager roles)
router.post(
  "/",
  verifyUser,
  roleMiddleware("admin"),
  addComment
);

router.put(
  "/:comment_id",
  verifyUser,
  roleMiddleware("admin"),
  updateComment
);

router.delete(
  "/:comment_id",
  verifyUser,
  roleMiddleware("admin"),
  deleteComment
);

export default router;
