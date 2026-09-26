import { Router } from "express";
import {
  addCertificate,
  deleteCertificate,
  getCertificateById,
  getAllCertificates,
  updateCertificate,
  countCertificates,
} from "../controllers/certifController.js";
import upload from "../middlewares/multer.js";
import verifyUser from "../middlewares/verifyUser.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = Router();

// Read-only routes (accessible to all, or you can add verifyUser if needed)
router.get("/", getAllCertificates);
router.get("/:id", getCertificateById);
router.get("/count/certificates", countCertificates);

// Write routes (restricted to admin and manager roles)
router.post(
  "/",
  verifyUser,
  roleMiddleware("admin"),
  upload.single("image"),
  addCertificate
);

router.put(
  "/:id",
  verifyUser,
  roleMiddleware("admin"),
  upload.single("image"),
  updateCertificate
);

router.delete("/:id", verifyUser, roleMiddleware("admin"), deleteCertificate);

export default router;
