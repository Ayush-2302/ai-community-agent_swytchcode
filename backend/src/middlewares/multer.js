import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const routeFolder = req.baseUrl.split("api/")[1];
    const uploadDir = path.join(__dirname, "../uploads", routeFolder);
    try {
      await fs
        .access(uploadDir)
        .catch(() => fs.mkdir(uploadDir, { recursive: true }));
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extname);
    cb(null, `${basename}-${Date.now()}${extname}`);
  },
});

const upload = multer({ storage });

export default upload;
